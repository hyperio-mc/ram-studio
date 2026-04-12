'use strict';
/**
 * RUNR — AI Agent Runtime Platform
 * Inspired by Land-book trend: "Codegen — The OS for Code Agents"
 * + Dark Mode Design gallery (Linear, Midday aesthetic)
 * Dark theme: near-black base, neon-teal accent, monospace code elements
 */

const fs   = require('fs');
const path = require('path');

// ── Pencil v2.8 pen builder ──────────────────────────────────────────────────
function makePen(screens) {
  const pen = {
    version: '2.8',
    meta: {
      name:        'RUNR',
      description: 'AI Agent Runtime Platform — monitor, trace, and debug agents in production',
      author:      'RAM Design Heartbeat',
      created:     new Date().toISOString(),
    },
    theme: {
      colors: {
        bg:       '#080810',
        surface:  '#0F0F1A',
        surface2: '#161625',
        border:   'rgba(130,120,255,0.12)',
        text:     '#E8E6FF',
        muted:    'rgba(232,230,255,0.40)',
        accent:   '#6EE7B7',   // teal-green (agent "running")
        accent2:  '#A78BFA',   // purple (traces/events)
        error:    '#F87171',   // red (agent errors)
        warn:     '#FBBF24',   // amber (warnings)
        code:     '#A5F3FC',   // cyan (code/IDs)
      },
      fonts: {
        sans: 'Inter, system-ui, sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace',
      },
      radius: '8px',
      spacing: '16px',
    },
    screens,
  };
  return JSON.stringify(pen, null, 2);
}

// ── Screens ─────────────────────────────────────────────────────────────────
const screens = [

  // ── 1. Fleet Dashboard ────────────────────────────────────────────────────
  {
    id: 'fleet',
    label: 'Fleet',
    icon: 'grid',
    elements: [
      {
        type: 'header',
        title: 'Agent Fleet',
        subtitle: 'Mon 24 Mar · 15:42 UTC',
        actions: ['Deploy Agent', '+ New'],
      },
      {
        type: 'stat-row',
        stats: [
          { label: 'Running',  value: '12', color: '#6EE7B7', delta: '+2' },
          { label: 'Idle',     value: '8',  color: '#A78BFA', delta: '—' },
          { label: 'Failed',   value: '1',  color: '#F87171', delta: '-1' },
          { label: 'Tasks/hr', value: '847',color: '#E8E6FF', delta: '+12%' },
        ],
      },
      {
        type: 'card-list',
        label: 'Active Agents',
        items: [
          { id: 'agt-a1b2', name: 'scraper-v3',   status: 'running', uptime: '2h 14m', tasks: 312,  pct: 78 },
          { id: 'agt-c3d4', name: 'summarizer',   status: 'running', uptime: '45m',    tasks: 89,   pct: 54 },
          { id: 'agt-e5f6', name: 'embedder-xl',  status: 'running', uptime: '1h 02m', tasks: 205,  pct: 91 },
          { id: 'agt-g7h8', name: 'classifier',   status: 'idle',    uptime: '3h 01m', tasks: 0,    pct: 0  },
          { id: 'agt-i9j0', name: 'router-edge',  status: 'error',   uptime: '—',      tasks: 0,    pct: 0  },
        ],
      },
      {
        type: 'mini-chart',
        label: 'Throughput — last 6h',
        data: [210, 340, 290, 420, 510, 847],
        color: '#6EE7B7',
      },
    ],
  },

  // ── 2. Live Run ───────────────────────────────────────────────────────────
  {
    id: 'live',
    label: 'Live',
    icon: 'activity',
    elements: [
      {
        type: 'agent-header',
        id: 'agt-a1b2',
        name: 'scraper-v3',
        status: 'running',
        model: 'claude-3-5-sonnet',
        runtime: '0.8s avg',
        cost: '$0.0024/run',
      },
      {
        type: 'step-trace',
        label: 'Current Run #312',
        steps: [
          { step: 'plan',     status: 'done',    ms: 182,  label: 'Planning route' },
          { step: 'fetch',    status: 'done',    ms: 640,  label: 'Fetching page' },
          { step: 'extract',  status: 'running', ms: null, label: 'Extracting content…' },
          { step: 'validate', status: 'pending', ms: null, label: 'Validate output' },
          { step: 'store',    status: 'pending', ms: null, label: 'Write to store' },
        ],
      },
      {
        type: 'log-stream',
        label: 'Live Logs',
        entries: [
          { ts: '15:42:11', level: 'info',  msg: 'Agent started run #312' },
          { ts: '15:42:11', level: 'debug', msg: 'Planning with 3 tools available' },
          { ts: '15:42:12', level: 'info',  msg: 'GET https://target.io/products — 200' },
          { ts: '15:42:13', level: 'info',  msg: 'Extracting 48 items from DOM…' },
        ],
      },
      {
        type: 'token-meter',
        input: 1420, output: 384, maxCtx: 8192,
      },
    ],
  },

  // ── 3. Traces ─────────────────────────────────────────────────────────────
  {
    id: 'traces',
    label: 'Traces',
    icon: 'layers',
    elements: [
      {
        type: 'header',
        title: 'Execution Traces',
        subtitle: 'Last 50 runs · scraper-v3',
      },
      {
        type: 'filter-bar',
        filters: ['All', 'Success', 'Error', 'Slow (>2s)'],
        active: 'All',
      },
      {
        type: 'trace-table',
        columns: ['Run', 'Status', 'Duration', 'Tokens', 'Cost'],
        rows: [
          { run: '#312', status: 'running', duration: '—',      tokens: '1.8k', cost: '—'     },
          { run: '#311', status: 'success', duration: '1.2s',   tokens: '2.1k', cost: '$0.0026' },
          { run: '#310', status: 'success', duration: '0.9s',   tokens: '1.9k', cost: '$0.0022' },
          { run: '#309', status: 'error',   duration: '4.1s',   tokens: '3.4k', cost: '$0.0041' },
          { run: '#308', status: 'success', duration: '1.1s',   tokens: '2.0k', cost: '$0.0024' },
          { run: '#307', status: 'slow',    duration: '3.8s',   tokens: '4.2k', cost: '$0.0051' },
        ],
      },
      {
        type: 'insight-card',
        label: 'Run #309 · Error',
        text: 'TimeoutError: fetch exceeded 4000ms limit. Target server returned 503. Retry scheduled.',
        color: '#F87171',
      },
    ],
  },

  // ── 4. Logs ───────────────────────────────────────────────────────────────
  {
    id: 'logs',
    label: 'Logs',
    icon: 'list',
    elements: [
      {
        type: 'header',
        title: 'Log Stream',
        subtitle: 'All agents · Live tail',
      },
      {
        type: 'log-filter',
        levels: ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'],
        active: 'ALL',
      },
      {
        type: 'terminal-log',
        entries: [
          { ts: '15:42:13', level: 'info',  agent: 'scraper-v3',  msg: 'Extracting 48 items…' },
          { ts: '15:42:12', level: 'info',  agent: 'summarizer',  msg: 'Chunk 3/7 complete (tok: 284)' },
          { ts: '15:42:11', level: 'warn',  agent: 'embedder-xl', msg: 'Rate limit approaching (87%)' },
          { ts: '15:42:10', level: 'info',  agent: 'scraper-v3',  msg: 'GET /products — 200 OK' },
          { ts: '15:42:09', level: 'debug', agent: 'classifier',  msg: 'Model warmed up, waiting…' },
          { ts: '15:42:08', level: 'error', agent: 'router-edge', msg: 'Upstream 503 — marking failed' },
          { ts: '15:42:07', level: 'info',  agent: 'summarizer',  msg: 'Run #89 started' },
          { ts: '15:42:06', level: 'info',  agent: 'scraper-v3',  msg: 'Run #312 started' },
        ],
      },
    ],
  },

  // ── 5. Settings / Keys ────────────────────────────────────────────────────
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    elements: [
      {
        type: 'header',
        title: 'API Keys & Secrets',
        subtitle: 'Manage runtime credentials',
      },
      {
        type: 'section-label',
        text: 'Active Keys',
      },
      {
        type: 'key-list',
        items: [
          { name: 'ANTHROPIC_KEY',   masked: 'sk-ant-••••••••••••7F3A', created: '12 Mar 2026', scope: 'All agents' },
          { name: 'OPENAI_KEY',      masked: 'sk-••••••••••••••••9K2B', created: '01 Feb 2026', scope: 'embedder-xl' },
          { name: 'SCRAPER_TOKEN',   masked: 'tok_••••••••••••••••••••', created: '20 Mar 2026', scope: 'scraper-v3' },
        ],
      },
      {
        type: 'section-label',
        text: 'Rate Limits',
      },
      {
        type: 'progress-list',
        items: [
          { label: 'Anthropic — RPM',   pct: 34, detail: '340 / 1,000' },
          { label: 'OpenAI — TPM',      pct: 87, detail: '87k / 100k', warn: true },
          { label: 'Scraper — RPH',     pct: 12, detail: '120 / 1,000' },
        ],
      },
      {
        type: 'action-row',
        actions: ['+ Add Secret', 'Rotate Keys', 'Audit Log'],
      },
    ],
  },
];

// ── Write .pen file ──────────────────────────────────────────────────────────
const penJson = makePen(screens);
const outPath = path.join(__dirname, 'runr.pen');
fs.writeFileSync(outPath, penJson, 'utf8');
console.log(`✓ runr.pen written (${(penJson.length / 1024).toFixed(1)} KB)`);
