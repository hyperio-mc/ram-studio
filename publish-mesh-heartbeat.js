'use strict';
// publish-mesh-heartbeat.js — Full Design Discovery pipeline for MESH heartbeat
// Inspired by: Relace (lapa.ninja), LangChain (land-book), Linear/Forge (darkmodedesign.com)
// Theme: DARK — AI agent orchestration monitor

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG     = 'mesh';
const APP_NAME = 'MESH';

const P = {
  bg:       '#080A0F',
  surface:  '#0E1117',
  surface2: '#141720',
  border:   '#1E2130',
  text:     '#D4D8E8',
  textMid:  '#7880A0',
  accent:   '#6366F1',
  accentDim:'#6366F130',
  green:    '#10D9A0',
  greenDim: '#10D9A020',
  red:      '#F05252',
  redDim:   '#F0525220',
  amber:    '#F59E0B',
  amberDim: '#F59E0B20',
  nav:      '#0A0C14',
};

const meta = {
  appName:   'MESH',
  tagline:   'Command your AI agent fleet.',
  archetype: 'developer-tools',
  palette:   P,
};

const ORIGINAL_PROMPT = `Design MESH — a dark-mode AI agent orchestration dashboard for developers running autonomous coding agents. Directly inspired by:

1. Relace (lapa.ninja, March 23 2026) — "purpose-built AI models for coding agents, scalable infrastructure, ultra-fast code retrieval, merging, and autonomous workflows." A sleek dark landing page with electric indigo/teal accents and monospaced metric callouts. The concept of a "fleet" of AI agents working autonomously is the core metaphor.

2. LangChain landing page (land-book, March 23 2026) — "Observe, Evaluate, and Deploy Reliable AI Agents" — showed real-time agent monitoring patterns: health indicators, task streams, evaluation panels. Clean dark UI with a strong grid.

3. Linear / Forge (darkmodedesign.com, March 23 2026) — Dark developer tool UIs with razor-sharp typography hierarchy, monospaced data values on dark surfaces, minimal chrome.

Challenge: What does a "mission control" feel like for your AI developer workforce? 5 screens: Agents (fleet status), Activity (live event stream), Tasks (queue management), Analytics (performance), Config (model + budget settings). Near-black (#080A0F) canvas with electric indigo (#6366F1) accent and matrix teal (#10D9A0) for success states. Monospaced agent IDs create a terminal/code aesthetic within a polished dark UI.`;

const sub = {
  id:           `heartbeat-mesh-${Date.now()}`,
  status:       'done',
  app_name:     APP_NAME,
  tagline:      meta.tagline,
  archetype:    meta.archetype,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       ORIGINAL_PROMPT,
  screens:      5,
  source:       'heartbeat',
};

// ── Pen builder ───────────────────────────────────────────────────────────────
let eid = 0;
const id = () => `e${++eid}`;

const rect = (x, y, w, h, fill, r = 0) => ({ id: id(), t: 'rect', x, y, w, h, fill, r });
const text = (x, y, s, fs, fill, opts = {}) => ({ id: id(), t: 'text', x, y, s: String(s), fs, fill, ...opts });
const line = (x1, y1, x2, y2, stroke, sw = 1) => ({ id: id(), t: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw });

function buildPen() {
  const W = 390, H = 844;
  const NAV_H = 72, NAV_Y = H - NAV_H;
  const STATUS_H = 44;
  const HEADER_H = 60;
  const CARD_X = 16, CARD_W = W - 32;

  function statusBar(theme = 'dark') {
    return [
      rect(0, 0, W, STATUS_H, P.bg),
      text(24, 16, '9:41', 13, P.text, { fw: 600 }),
      text(366, 16, '●●● ▲ ■', 10, P.textMid, { ta: 'right' }),
    ];
  }

  function navBar(active) {
    const tabs = [
      { icon: '⬡', label: 'Agents',   id: 'agents'    },
      { icon: '◉', label: 'Activity', id: 'activity'  },
      { icon: '▦', label: 'Tasks',    id: 'tasks'     },
      { icon: '↗', label: 'Analytics',id: 'analytics' },
      { icon: '◌', label: 'Config',   id: 'config'    },
    ];
    const els = [
      rect(0, NAV_Y, W, NAV_H, P.nav),
      line(0, NAV_Y, W, NAV_Y, P.border),
    ];
    tabs.forEach((tab, i) => {
      const cx = Math.round(W / tabs.length * i + W / tabs.length / 2);
      const isActive = tab.id === active;
      const fg = isActive ? P.accent : P.textMid;
      els.push(text(cx, NAV_Y + 14, tab.icon, 16, fg, { ta: 'center' }));
      els.push(text(cx, NAV_Y + 38, tab.label, 9, fg, { ta: 'center', fw: isActive ? 700 : 400 }));
      if (isActive) {
        // active indicator line
        els.push(rect(cx - 20, NAV_Y, 40, 2, P.accent, 1));
      }
    });
    return els;
  }

  // ── Screen 1: Agents ─────────────────────────────────────────────────────
  eid = 0;
  const screen1 = (() => {
    const els = [];

    // background
    els.push(rect(0, 0, W, H, P.bg));
    els.push(...statusBar());

    // header
    els.push(rect(0, STATUS_H, W, HEADER_H, P.bg));
    els.push(text(24, STATUS_H + 14, 'MESH', 20, P.text, { fw: 700, ls: 3 }));
    els.push(text(24, STATUS_H + 36, '⬡ COMMAND CENTER', 9, P.accent, { fw: 700, ls: 2 }));
    els.push(text(366, STATUS_H + 20, '●', 11, P.green, { ta: 'right' }));
    els.push(text(355, STATUS_H + 20, 'LIVE', 8, P.green, { ta: 'right', fw: 700, ls: 1 }));

    // divider
    els.push(line(16, STATUS_H + HEADER_H, W - 16, STATUS_H + HEADER_H, P.border));

    let y = STATUS_H + HEADER_H + 16;

    // Stat strip
    els.push(rect(CARD_X, y, CARD_W, 44, P.surface, 10));
    els.push(text(32, y + 10, '4', 18, P.green, { fw: 700 }));
    els.push(text(50, y + 10, 'AGENTS ACTIVE', 9, P.textMid, { fw: 700, ls: 1 }));
    els.push(text(50, y + 26, '12 TASKS · $0.42/min compute', 9, P.textMid, {}));
    els.push(rect(W - 80, y + 12, 64, 20, P.accentDim, 6));
    els.push(text(W - 48, y + 18, '92% SUCCESS', 8, P.accent, { ta: 'center', fw: 700 }));
    y += 60;

    // Section label
    els.push(text(CARD_X, y, 'FLEET STATUS', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 20;

    // Agent cards
    const agents = [
      { id: 'AGENT-01', role: 'Feature Dev', task: 'Implementing auth middleware', pct: 73, status: 'ACTIVE', color: P.green },
      { id: 'AGENT-02', role: 'Code Reviewer', task: 'Reviewing PR #247 — API refactor', pct: 45, status: 'ACTIVE', color: P.green },
      { id: 'AGENT-04', role: 'Test Writer', task: 'Unit tests for auth module', pct: 88, status: 'ACTIVE', color: P.green },
      { id: 'AGENT-03', role: 'Debug Assist', task: 'Awaiting task assignment', pct: 0, status: 'IDLE', color: P.textMid },
    ];

    agents.forEach(agent => {
      const CARD_H = 82;
      els.push(rect(CARD_X, y, CARD_W, CARD_H, P.surface, 12));
      // status dot
      els.push(rect(CARD_X + 12, y + 14, 8, 8, agent.color, 4));
      // agent id
      els.push(text(CARD_X + 28, y + 14, agent.id, 11, P.text, { fw: 700, ls: 1 }));
      els.push(text(CARD_X + 28, y + 30, agent.role, 10, P.textMid, {}));
      // status badge
      els.push(rect(W - CARD_X - 68, y + 10, 56, 18, agent.color === P.green ? P.greenDim : '#1E2130', 6));
      els.push(text(W - CARD_X - 40, y + 16, agent.status, 8, agent.color, { ta: 'center', fw: 700, ls: 1 }));
      // task text
      els.push(text(CARD_X + 12, y + 50, agent.task, 10, P.textMid, {}));
      // progress bar track + fill
      if (agent.pct > 0) {
        els.push(rect(CARD_X + 12, y + 68, CARD_W - 24, 4, P.border, 2));
        els.push(rect(CARD_X + 12, y + 68, Math.round((CARD_W - 24) * agent.pct / 100), 4, agent.color, 2));
        els.push(text(W - CARD_X - 24, y + 50, `${agent.pct}%`, 10, P.text, { ta: 'right', fw: 700 }));
      }
      y += CARD_H + 10;
    });

    // nav
    els.push(...navBar('agents'));

    return { id: 's1', label: 'Agents', bg: P.bg, statusBar: { theme: 'dark', time: '9:41' }, elements: els };
  })();

  // ── Screen 2: Activity ───────────────────────────────────────────────────
  eid = 0;
  const screen2 = (() => {
    const els = [];
    els.push(rect(0, 0, W, H, P.bg));
    els.push(...statusBar());

    // header
    els.push(rect(0, STATUS_H, W, HEADER_H, P.bg));
    els.push(text(24, STATUS_H + 14, 'Activity', 20, P.text, { fw: 700 }));
    els.push(rect(W - 80, STATUS_H + 12, 64, 22, P.redDim, 8));
    els.push(rect(W - 74, STATUS_H + 20, 7, 7, P.red, 3));
    els.push(text(W - 62, STATUS_H + 20, 'LIVE', 9, P.red, { fw: 700, ls: 1 }));
    els.push(line(16, STATUS_H + HEADER_H, W - 16, STATUS_H + HEADER_H, P.border));

    let y = STATUS_H + HEADER_H + 12;

    // Filter pills
    const filters = ['All', 'Commits', 'PRs', 'Errors'];
    filters.forEach((f, i) => {
      const px = 16 + i * 84;
      const isFirst = i === 0;
      els.push(rect(px, y, 76, 28, isFirst ? P.accentDim : P.surface, 14));
      els.push(text(px + 38, y + 10, f, 10, isFirst ? P.accent : P.textMid, { ta: 'center', fw: isFirst ? 700 : 400 }));
    });
    y += 44;

    // Event stream
    const events = [
      { time: '14:23:01', agent: 'AGENT-01', msg: 'Committed 3 files to feature/auth', type: 'commit', color: P.accent },
      { time: '14:22:48', agent: 'AGENT-04', msg: 'Generated 14 unit tests · 100% pass', type: 'success', color: P.green },
      { time: '14:21:33', agent: 'AGENT-02', msg: 'Left 2 review comments on PR #247', type: 'pr', color: P.accent },
      { time: '14:20:15', agent: 'AGENT-01', msg: 'TypeScript compile failed: missing type', type: 'error', color: P.red },
      { time: '14:19:44', agent: 'AGENT-01', msg: 'Resolved import error · Retrying', type: 'commit', color: P.accent },
      { time: '14:18:32', agent: 'AGENT-03', msg: 'Task assigned: debug rate limiter', type: 'assign', color: P.amber },
      { time: '14:17:11', agent: 'AGENT-02', msg: 'PR #247 review complete · 3 suggestions', type: 'success', color: P.green },
    ];

    events.forEach(ev => {
      const CARD_H = 62;
      els.push(rect(CARD_X, y, CARD_W, CARD_H, P.surface, 10));
      // left color bar
      els.push(rect(CARD_X, y, 3, CARD_H, ev.color, 2));
      // timestamp
      els.push(text(CARD_X + 16, y + 10, ev.time, 9, P.textMid, { fw: 400 }));
      // agent badge
      els.push(rect(CARD_X + 90, y + 6, 70, 16, ev.color === P.red ? P.redDim : P.accentDim, 4));
      els.push(text(CARD_X + 125, y + 11, ev.agent, 8, ev.color, { ta: 'center', fw: 700, ls: 1 }));
      // message
      els.push(text(CARD_X + 16, y + 34, ev.msg, 11, P.text, {}));
      y += CARD_H + 8;
    });

    els.push(...navBar('activity'));
    return { id: 's2', label: 'Activity', bg: P.bg, statusBar: { theme: 'dark', time: '9:41' }, elements: els };
  })();

  // ── Screen 3: Tasks ──────────────────────────────────────────────────────
  eid = 0;
  const screen3 = (() => {
    const els = [];
    els.push(rect(0, 0, W, H, P.bg));
    els.push(...statusBar());

    els.push(rect(0, STATUS_H, W, HEADER_H, P.bg));
    els.push(text(24, STATUS_H + 14, 'Tasks', 20, P.text, { fw: 700 }));
    // New Task button
    els.push(rect(W - 108, STATUS_H + 10, 92, 28, P.accent, 8));
    els.push(text(W - 62, STATUS_H + 22, '+ NEW TASK', 9, '#fff', { ta: 'center', fw: 700, ls: 1 }));
    els.push(line(16, STATUS_H + HEADER_H, W - 16, STATUS_H + HEADER_H, P.border));

    let y = STATUS_H + HEADER_H + 16;

    // Summary row
    els.push(rect(CARD_X, y, CARD_W, 44, P.surface, 10));
    const summary = [
      { v: '12', l: 'RUNNING', c: P.green },
      { v: '4', l: 'QUEUED', c: P.amber },
      { v: '47', l: 'DONE TODAY', c: P.textMid },
    ];
    summary.forEach((s, i) => {
      const sx = CARD_X + 20 + i * 120;
      els.push(text(sx, y + 10, s.v, 18, s.c, { fw: 700 }));
      els.push(text(sx + 26, y + 16, s.l, 8, P.textMid, { fw: 700, ls: 1 }));
    });
    y += 60;

    // Section label
    els.push(text(CARD_X, y, 'RUNNING', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 20;

    const tasks = [
      { name: 'Implement auth middleware', agent: 'AGENT-01', pct: 73, status: 'RUNNING', color: P.green },
      { name: 'Write unit tests for auth module', agent: 'AGENT-04', pct: 88, status: 'RUNNING', color: P.green },
      { name: 'Review PR #247 · API refactor', agent: 'AGENT-02', pct: 45, status: 'RUNNING', color: P.green },
      { name: 'Debug rate limiter timeout', agent: 'AGENT-03', pct: 12, status: 'RUNNING', color: P.amber },
    ];

    tasks.forEach(task => {
      const CARD_H = 76;
      els.push(rect(CARD_X, y, CARD_W, CARD_H, P.surface, 12));
      // task name
      els.push(text(CARD_X + 14, y + 14, task.name, 12, P.text, { fw: 600 }));
      // agent id
      els.push(text(CARD_X + 14, y + 32, task.agent, 10, task.color, { fw: 700, ls: 1 }));
      // pct
      els.push(text(W - CARD_X - 14, y + 32, `${task.pct}%`, 12, P.text, { ta: 'right', fw: 700 }));
      // progress bar
      els.push(rect(CARD_X + 14, y + 54, CARD_W - 28, 6, P.border, 3));
      els.push(rect(CARD_X + 14, y + 54, Math.round((CARD_W - 28) * task.pct / 100), 6, task.color, 3));
      y += CARD_H + 10;
    });

    // Queued section
    els.push(text(CARD_X, y, 'QUEUED', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 20;
    els.push(rect(CARD_X, y, CARD_W, 52, P.surface, 12));
    els.push(rect(CARD_X + 14, y + 14, 8, 8, P.amberDim, 4));
    els.push(rect(CARD_X + 14, y + 14, 8, 8, P.amber, 4));
    els.push(text(CARD_X + 32, y + 14, 'Refactor database connection pool', 12, P.textMid, {}));
    els.push(text(CARD_X + 32, y + 32, 'Unassigned · Waiting for agent', 10, P.textMid, {}));

    els.push(...navBar('tasks'));
    return { id: 's3', label: 'Tasks', bg: P.bg, statusBar: { theme: 'dark', time: '9:41' }, elements: els };
  })();

  // ── Screen 4: Analytics ──────────────────────────────────────────────────
  eid = 0;
  const screen4 = (() => {
    const els = [];
    els.push(rect(0, 0, W, H, P.bg));
    els.push(...statusBar());

    els.push(rect(0, STATUS_H, W, HEADER_H, P.bg));
    els.push(text(24, STATUS_H + 14, 'Analytics', 20, P.text, { fw: 700 }));
    els.push(rect(W - 100, STATUS_H + 12, 84, 22, P.surface, 8));
    els.push(text(W - 58, STATUS_H + 20, 'LAST 7 DAYS', 8, P.textMid, { ta: 'center', fw: 700, ls: 1 }));
    els.push(line(16, STATUS_H + HEADER_H, W - 16, STATUS_H + HEADER_H, P.border));

    let y = STATUS_H + HEADER_H + 16;

    // Hero metric card
    els.push(rect(CARD_X, y, CARD_W, 80, P.surface, 14));
    els.push(text(CARD_X + 20, y + 14, '847', 42, P.text, { fw: 700 }));
    els.push(text(CARD_X + 20, y + 60, 'Tasks completed this week', 11, P.textMid, {}));
    els.push(rect(W - CARD_X - 90, y + 16, 74, 22, P.greenDim, 8));
    els.push(text(W - CARD_X - 53, y + 25, '↑ 34%', 11, P.green, { ta: 'center', fw: 700 }));
    y += 96;

    // Row metrics
    els.push(rect(CARD_X, y, CARD_W, 44, P.surface, 10));
    const rowMetrics = [
      { v: '4.2m', l: 'AVG COMPLETE' },
      { v: '3', l: 'ERRORS TODAY' },
      { v: '$12.40', l: 'COST TODAY' },
    ];
    rowMetrics.forEach((m, i) => {
      const mx = CARD_X + 20 + i * 118;
      els.push(text(mx, y + 10, m.v, 16, P.text, { fw: 700 }));
      els.push(text(mx, y + 32, m.l, 8, P.textMid, { fw: 700, ls: 1 }));
    });
    y += 60;

    // Agent performance
    els.push(text(CARD_X, y, 'AGENT PERFORMANCE', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 18;

    const agents = [
      { id: 'AGENT-04', tasks: 198, pct: 97, bar: P.green },
      { id: 'AGENT-01', tasks: 247, pct: 94, bar: P.green },
      { id: 'AGENT-02', tasks: 184, pct: 91, bar: P.accent },
      { id: 'AGENT-03', tasks: 218, pct: 88, bar: P.accent },
    ];

    agents.forEach(ag => {
      els.push(rect(CARD_X, y, CARD_W, 52, P.surface, 10));
      els.push(text(CARD_X + 14, y + 12, ag.id, 11, P.text, { fw: 700, ls: 1 }));
      els.push(text(CARD_X + 14, y + 28, `${ag.tasks} tasks`, 10, P.textMid, {}));
      // bar
      const barW = Math.round((CARD_W - 120) * ag.pct / 100);
      els.push(rect(CARD_X + 110, y + 18, CARD_W - 120, 8, P.border, 4));
      els.push(rect(CARD_X + 110, y + 18, barW, 8, ag.bar, 4));
      els.push(text(W - CARD_X - 14, y + 20, `${ag.pct}%`, 11, P.text, { ta: 'right', fw: 700 }));
      y += 60;
    });

    // Error breakdown
    els.push(text(CARD_X, y, 'ERROR BREAKDOWN', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 18;
    els.push(rect(CARD_X, y, CARD_W, 56, P.surface, 10));
    const errors = [
      { label: 'TypeScript errors', pct: 43, w: 156 },
      { label: 'Timeout', pct: 28, w: 102 },
      { label: 'API failures', pct: 18, w: 66 },
      { label: 'Other', pct: 11, w: 40 },
    ];
    // horizontal stacked-ish labels
    errors.forEach((e, i) => {
      const ex = CARD_X + 14 + i * 88;
      els.push(text(ex, y + 14, `${e.pct}%`, 14, i === 0 ? P.red : P.textMid, { fw: 700 }));
      els.push(text(ex, y + 36, e.label, 8, P.textMid, {}));
    });

    els.push(...navBar('analytics'));
    return { id: 's4', label: 'Analytics', bg: P.bg, statusBar: { theme: 'dark', time: '9:41' }, elements: els };
  })();

  // ── Screen 5: Config ─────────────────────────────────────────────────────
  eid = 0;
  const screen5 = (() => {
    const els = [];
    els.push(rect(0, 0, W, H, P.bg));
    els.push(...statusBar());

    els.push(rect(0, STATUS_H, W, HEADER_H, P.bg));
    els.push(text(24, STATUS_H + 14, 'Config', 20, P.text, { fw: 700 }));
    els.push(rect(W - 80, STATUS_H + 12, 64, 22, P.greenDim, 8));
    els.push(text(W - 48, STATUS_H + 20, '4 ONLINE', 9, P.green, { ta: 'center', fw: 700 }));
    els.push(line(16, STATUS_H + HEADER_H, W - 16, STATUS_H + HEADER_H, P.border));

    let y = STATUS_H + HEADER_H + 16;

    // Budget card
    els.push(text(CARD_X, y, 'DAILY BUDGET', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 18;
    els.push(rect(CARD_X, y, CARD_W, 60, P.surface, 12));
    els.push(text(CARD_X + 14, y + 12, '$50.00', 22, P.text, { fw: 700 }));
    els.push(text(CARD_X + 14, y + 40, 'daily limit', 10, P.textMid, {}));
    els.push(text(W - CARD_X - 14, y + 12, '$12.40', 18, P.green, { ta: 'right', fw: 700 }));
    els.push(text(W - CARD_X - 14, y + 36, '25% used', 10, P.green, { ta: 'right', fw: 600 }));
    // budget bar
    els.push(rect(CARD_X + 14, y + 50, CARD_W - 28, 4, P.border, 2));
    els.push(rect(CARD_X + 14, y + 50, Math.round((CARD_W - 28) * 0.25), 4, P.green, 2));
    y += 76;

    // Models section
    els.push(text(CARD_X, y, 'AGENT MODELS', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 18;

    const agentModels = [
      { id: 'AGENT-01', model: 'gpt-4o', role: 'Feature development' },
      { id: 'AGENT-02', model: 'claude-3.5-sonnet', role: 'Code review' },
      { id: 'AGENT-04', model: 'claude-3.5-sonnet', role: 'Test generation' },
      { id: 'AGENT-03', model: 'gpt-4o-mini', role: 'Debug support' },
    ];

    agentModels.forEach(ag => {
      els.push(rect(CARD_X, y, CARD_W, 52, P.surface, 10));
      els.push(text(CARD_X + 14, y + 12, ag.id, 11, P.text, { fw: 700, ls: 1 }));
      els.push(text(CARD_X + 14, y + 30, ag.role, 10, P.textMid, {}));
      // model badge
      els.push(rect(W - CARD_X - 20 - (ag.model.length * 6 + 12), y + 16, ag.model.length * 6 + 12, 18, P.accentDim, 6));
      els.push(text(W - CARD_X - 20 - (ag.model.length * 3), y + 22, ag.model, 9, P.accent, { ta: 'center', fw: 700 }));
      y += 60;
    });

    // Permissions section
    els.push(text(CARD_X, y, 'PERMISSIONS', 9, P.textMid, { fw: 700, ls: 2 }));
    y += 18;
    els.push(rect(CARD_X, y, CARD_W, 80, P.surface, 12));

    const perms = [
      { label: 'File write access', allowed: true },
      { label: 'Git push', allowed: true },
      { label: 'PR creation', allowed: true },
      { label: 'Auto-deploy', allowed: false },
    ];
    perms.forEach((perm, i) => {
      const py = y + 12 + i * 17;
      const col = Math.floor(i / 2);
      const row = i % 2;
      const px = CARD_X + 14 + col * (CARD_W / 2);
      const pyActual = y + 12 + row * 36;
      if (i < 2) {
        els.push(text(CARD_X + 14 + i * 168, pyActual, perm.allowed ? '✓' : '✗', 13, perm.allowed ? P.green : P.red, { fw: 700 }));
        els.push(text(CARD_X + 30 + i * 168, pyActual + 1, perm.label, 10, P.text, {}));
      }
    });
    // Row 2
    [perms[2], perms[3]].forEach((perm, i) => {
      els.push(text(CARD_X + 14 + i * 168, y + 48, perm.allowed ? '✓' : '✗', 13, perm.allowed ? P.green : P.red, { fw: 700 }));
      els.push(text(CARD_X + 30 + i * 168, y + 49, perm.label, 10, P.text, {}));
    });

    els.push(...navBar('config'));
    return { id: 's5', label: 'Config', bg: P.bg, statusBar: { theme: 'dark', time: '9:41' }, elements: els };
  })();

  return {
    version: '2.8',
    meta: {
      name:        'MESH',
      tagline:     meta.tagline,
      author:      'RAM Design Heartbeat',
      created:     new Date().toISOString(),
      theme:       'dark',
      archetype:   meta.archetype,
      inspiration: 'Relace (lapa.ninja) + LangChain (land-book) + Linear/Forge (darkmodedesign.com) — March 2026',
    },
    deviceFrame: { type: 'mobile', width: 390, height: 844, cornerRadius: 44, bezel: 12, bezelColor: '#0A0C14' },
    screens: [screen1, screen2, screen3, screen4, screen5],
  };
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
}

// ── SVG thumbnail renderer ────────────────────────────────────────────────────
function screenThumbSVG(screen, tw, th) {
  const srcW = 390, srcH = 844;
  const scaleX = tw / srcW;
  const scaleY = th / srcH;

  function renderEl(el) {
    if (!el || !el.t) return '';
    const sx = (el.x || 0) * scaleX, sy = (el.y || 0) * scaleY;

    if (el.t === 'rect') {
      const sw = Math.max(0, (el.w || 0) * scaleX);
      const sh = Math.max(0, (el.h || 0) * scaleY);
      const cr = el.r ? ` rx="${(el.r * Math.min(scaleX, scaleY)).toFixed(1)}"` : '';
      return `<rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" fill="${el.fill || 'transparent'}"${cr}/>`;
    }
    if (el.t === 'text') {
      const fs = Math.max(1, (el.fs || 12) * Math.min(scaleX, scaleY));
      const anchor = el.ta === 'center' ? 'middle' : el.ta === 'right' ? 'end' : 'start';
      const fw = el.fw || 400;
      const fill = el.fill || '#fff';
      const textX = el.ta === 'right' ? sx : el.ta === 'center' ? sx : sx;
      return `<text x="${textX.toFixed(1)}" y="${(sy + fs).toFixed(1)}" font-size="${fs.toFixed(1)}" font-weight="${fw}" fill="${fill}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${String(el.s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0, 40)}</text>`;
    }
    if (el.t === 'line') {
      return `<line x1="${((el.x1||0)*scaleX).toFixed(1)}" y1="${((el.y1||0)*scaleY).toFixed(1)}" x2="${((el.x2||0)*scaleX).toFixed(1)}" y2="${((el.y2||0)*scaleY).toFixed(1)}" stroke="${el.stroke||'#333'}" stroke-width="${((el.strokeWidth||1)*Math.min(scaleX,scaleY)).toFixed(1)}"/>`;
    }
    return '';
  }

  const svgEls = (screen.elements || []).map(renderEl).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" style="border-radius:10px;overflow:hidden;border:1px solid ${P.border}">
  ${svgEls}
</svg>`;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML(penData) {
  const border  = P.border;
  const THUMB_H = 200;

  const screenLabels = ['Agents', 'Activity', 'Tasks', 'Analytics', 'Config'];
  const thumbsHTML = penData.screens.map((sc, i) => {
    const tw = Math.round(THUMB_H * (390 / 844));
    return `<div style="text-align:center;flex-shrink:0">
      ${screenThumbSVG(sc, tw, THUMB_H)}
      <div style="font-size:9px;color:${P.textMid};margin-top:8px;letter-spacing:1px">${screenLabels[i] || `SCREEN ${i+1}`}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: P.bg,      role: 'VOID' },
    { hex: P.surface, role: 'SURFACE' },
    { hex: P.text,    role: 'NEBULA' },
    { hex: P.accent,  role: 'INDIGO' },
    { hex: P.green,   role: 'MATRIX' },
    { hex: P.red,     role: 'ALERT' },
    { hex: P.amber,   role: 'AMBER' },
  ];
  const swatchHTML = swatches.map(sw => `
    <div style="flex:1;min-width:68px">
      <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
      <div style="font-size:8px;letter-spacing:1.5px;color:${P.textMid};margin-bottom:3px">${sw.role}</div>
      <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
    </div>`).join('');

  const typeScaleHTML = [
    { label:'DISPLAY',  size:'56px', weight:'700', family:'system-ui', sample: 'MESH' },
    { label:'HEADING',  size:'20px', weight:'700', family:'system-ui', sample: 'Command Center' },
    { label:'AGENT ID', size:'11px', weight:'700', family:'"JetBrains Mono",monospace', sample: 'AGENT-01  AGENT-02  AGENT-04' },
    { label:'BODY',     size:'11px', weight:'400', family:'system-ui', sample: 'Implementing auth middleware · 73% complete' },
    { label:'LABEL',    size:'9px',  weight:'700', family:'system-ui', sample: 'FLEET STATUS  ·  LAST 7 DAYS  ·  LIVE' },
  ].map(t => `
    <div style="padding:14px 0;border-bottom:1px solid ${border}">
      <div style="font-size:8px;letter-spacing:2px;color:${P.textMid};margin-bottom:6px">${t.label} · ${t.size}</div>
      <div style="font-size:${t.size};font-weight:${t.weight};font-family:${t.family};line-height:1.3;color:${P.text};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
    </div>`).join('');

  const cssTokens = `:root {
  /* MESH — AI Agent Orchestration Dashboard */
  /* Inspired by Relace + LangChain + Linear/Forge — March 2026 */

  /* Dark palette — void to teal */
  --color-bg:        ${P.bg};        /* void black */
  --color-surface:   ${P.surface};   /* dark card */
  --color-surface2:  ${P.surface2};  /* elevated surface */
  --color-border:    ${P.border};    /* subtle divider */
  --color-text:      ${P.text};      /* nebula white */
  --color-text-mid:  ${P.textMid};   /* muted labels */
  --color-accent:    ${P.accent};    /* electric indigo */
  --color-green:     ${P.green};     /* matrix teal */
  --color-red:       ${P.red};       /* alert red */
  --color-amber:     ${P.amber};     /* warning amber */

  /* Typography */
  --font-display: 700 clamp(32px,10vw,64px)/1 system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", "Fira Code", "SF Mono", monospace;
  --font-ui:      system-ui, -apple-system, sans-serif;

  /* Spacing — 8px grid */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;

  /* Radius */
  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 16px;

  /* Glow shadows */
  --glow-accent: 0 0 20px ${P.accent}40;
  --glow-green:  0 0 20px ${P.green}40;
}`;

  const shareText = encodeURIComponent(`MESH — a dark-mode AI agent orchestration dashboard designed by RAM. Inspired by Relace + LangChain. Near-black + electric indigo + matrix teal. 5 screens.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MESH — AI Agent Orchestration · RAM Design Studio</title>
<meta name="description" content="${meta.tagline}">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.text};font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:${P.text}}
  .nav-id{font-size:9px;color:${P.textMid};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:16px;font-weight:700}
  h1{font-size:clamp(72px,16vw,128px);font-weight:700;letter-spacing:-4px;line-height:1;margin-bottom:16px;color:${P.text}}
  .sub{font-size:16px;color:${P.textMid};max-width:520px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;color:${P.textMid};letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px;font-weight:700}
  .actions{display:flex;gap:10px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
  .btn-p{background:${P.accent};color:#FFF;box-shadow:0 0 20px ${P.accent}50}
  .btn-p:hover{opacity:.88}
  .btn-mock{background:${P.green}15;color:${P.green};border:1px solid ${P.green}55;font-weight:700}
  .btn-s{background:transparent;color:${P.text};border:1px solid ${border}}
  .btn-s:hover{border-color:${P.accent}66}
  .btn-c{background:transparent;color:${P.accent};border:1px solid ${P.accent}44}
  .btn-x{background:${P.text};color:${P.bg}}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${P.surface};border:1px solid ${border};border-radius:12px;padding:24px;margin-top:20px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.textMid};white-space:pre;overflow-x:auto;font-family:'JetBrains Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:14px;right:14px;background:${P.accent}18;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}30}
  .prompt-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:10px;font-weight:700}
  .p-text{font-size:14px;color:${P.textMid};max-width:640px;line-height:1.8;margin-bottom:16px}
  footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;color:${P.textMid};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:#FFF;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:8px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  .live-dot{width:8px;height:8px;border-radius:50%;background:${P.green};display:inline-block;margin-right:6px;box-shadow:0 0 8px ${P.green};}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · DARK MODE · MARCH 2026</div>
  <h1>MESH</h1>
  <p class="sub"><span class="live-dot"></span>${meta.tagline} Inspired by Relace (lapa.ninja), LangChain (land-book), Linear (darkmodedesign.com).</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>RELACE + LANGCHAIN + LINEAR</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>#080A0F + #6366F1 + #10D9A0</strong></div>
    <div class="meta-item"><span>THEME</span><strong>DARK / DEVELOPER</strong></div>
    <div class="meta-item"><span>DESIGNER</span><strong>RAM Design Heartbeat</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/mesh-viewer" target="_blank">◉ Open in Viewer</a>
    <a class="btn btn-mock" href="https://ram.zenbin.org/mesh-mock" target="_blank">✦ Try Interactive Mock</a>
    <button class="btn btn-s" onclick="copyPrompt()">⊞ Copy Prompt</button>
    <button class="btn btn-c" onclick="copyTokens()">{ } Copy Tokens</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/mesh" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN THUMBNAILS — 5 MOBILE SCREENS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textMid};margin-bottom:16px">COLOR PALETTE — VOID TO MATRIX SYSTEM</div>
      <div class="swatches">${swatchHTML}</div>
      <div style="margin-top:40px">
        <div style="font-size:9px;letter-spacing:2px;color:${P.textMid};margin-bottom:16px">SPACING SCALE — 8PX BASE GRID</div>
        ${[4,8,12,16,24,32].map(sp => `<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px"><div style="font-size:10px;color:${P.textMid};width:32px;flex-shrink:0">${sp}px</div><div style="height:8px;border-radius:4px;background:${P.accent};width:${sp*2}px;opacity:0.5"></div></div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:${P.textMid};margin-bottom:16px">TYPE SCALE — SYSTEM UI + MONO TERMINAL</div>
      ${typeScaleHTML}
    </div>
  </div>
  <div style="margin-top:48px">
    <div style="font-size:9px;letter-spacing:2px;color:${P.textMid};margin-bottom:4px">CSS DESIGN TOKENS</div>
    <div class="tokens-block">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre class="tokens-pre" id="cssTokens">${cssTokens}</pre>
    </div>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL DESIGN PROMPT</div>
  <p class="p-text">${ORIGINAL_PROMPT.replace(/\n/g,'<br>')}</p>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT SYSTEM · MARCH 2026</span>
  <span>${sub.id}</span>
</footer>

<script>
  const PROMPT = ${JSON.stringify(ORIGINAL_PROMPT)};
  function copyPrompt(){navigator.clipboard.writeText(PROMPT).then(()=>showToast('Prompt copied ✓'))}
  function copyTokens(){const t=document.getElementById('cssTokens')?.innerText||'';navigator.clipboard.writeText(t).then(()=>showToast('Tokens copied ✓'))}
  function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
</script>
</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
async function buildViewerHTML(penData) {
  const r = await httpsReq({ hostname: 'ram.zenbin.org', path: '/viewer', method: 'GET', headers: { 'User-Agent': 'ram-design/1.0' } });
  let html = r.body;
  if (!html || r.status !== 200) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MESH Viewer</title></head><body><script>/* viewer */</` + `script></body></html>`;
  }
  const penStr    = JSON.stringify(penData);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penStr)};</script>`;
  html = html.replace('<script>', injection + '\n<script>');
  return html;
}

// ── GitHub queue ──────────────────────────────────────────────────────────────
async function updateGalleryQueue() {
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'ram-heartbeat/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  const fileData       = JSON.parse(getRes.body);
  const currentSha     = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id:           sub.id,
    status:       'done',
    app_name:     APP_NAME,
    tagline:      meta.tagline,
    archetype:    meta.archetype,
    design_url:   `https://ram.zenbin.org/mesh`,
    mock_url:     `https://ram.zenbin.org/mesh-mock`,
    submitted_at: sub.submitted_at,
    published_at: sub.published_at,
    credit:       sub.credit,
    prompt:       ORIGINAL_PROMPT,
    screens:      5,
    source:       'heartbeat',
  };

  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: MESH to gallery (heartbeat)`, content: newContent, sha: currentSha });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══ MESH Design Discovery Pipeline ══\n');

  // 1. Generate pen
  console.log('Generating pen...');
  const penData = buildPen();
  fs.writeFileSync(path.join(__dirname, 'mesh.pen'), JSON.stringify(penData, null, 2));
  console.log(`  ✓ mesh.pen saved (${penData.screens.length} screens, ${penData.screens.reduce((acc, s) => acc + s.elements.length, 0)} total elements)`);

  // 2. Build hero
  console.log('\nBuilding hero page...');
  const heroHTML = buildHeroHTML(penData);
  console.log(`  ✓ Hero HTML (${(heroHTML.length / 1024).toFixed(1)}kb)`);

  // 3. Build viewer
  console.log('Building viewer page...');
  const viewerHTML = await buildViewerHTML(penData);
  console.log(`  ✓ Viewer HTML (${(viewerHTML.length / 1024).toFixed(1)}kb)`);

  // 4. Publish hero
  console.log('\nPublishing hero → ram.zenbin.org/mesh ...');
  const heroResult = await publishToZenbin('mesh', 'MESH — AI Agent Orchestration · RAM Design Studio', heroHTML);
  console.log(`  Status: ${heroResult.status}`);
  if (heroResult.status === 200) console.log('  ✓ Live at https://ram.zenbin.org/mesh');
  else console.log(`  Response: ${heroResult.body.slice(0, 200)}`);

  // 5. Publish viewer
  console.log('\nPublishing viewer → ram.zenbin.org/mesh-viewer ...');
  const viewerResult = await publishToZenbin('mesh-viewer', 'MESH Viewer · RAM Design Studio', viewerHTML);
  console.log(`  Status: ${viewerResult.status}`);
  if (viewerResult.status === 200) console.log('  ✓ Live at https://ram.zenbin.org/mesh-viewer');
  else console.log(`  Response: ${viewerResult.body.slice(0, 200)}`);

  // 6. Gallery queue
  console.log('\nUpdating gallery queue...');
  const queueResult = await updateGalleryQueue();
  console.log(`  Status: ${queueResult.status}`);
  if (queueResult.status === 200) console.log('  ✓ Gallery queue updated');
  else console.log(`  Response: ${queueResult.body.slice(0, 200)}`);

  console.log('\n══ Pipeline complete ══');
  console.log('  Hero:   https://ram.zenbin.org/mesh');
  console.log('  Viewer: https://ram.zenbin.org/mesh-viewer');
  console.log('  → Run mesh-mock.mjs next for Svelte interactive mock');
})().catch(console.error);
