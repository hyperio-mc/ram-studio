// nerve-mock.mjs — NERVE interactive Svelte mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NERVE',
  tagline:   'Mission control for your autonomous AI fleet',
  archetype: 'autonomous-ai-ops-dashboard',
  palette: {
    bg:      '#070B10',
    surface: '#0D1520',
    text:    '#E8F4F2',
    accent:  '#00E8C6',
    accent2: '#7B5CF0',
    muted:   'rgba(180,220,215,0.40)',
  },
  lightPalette: {
    bg:      '#F0F5F4',
    surface: '#FFFFFF',
    text:    '#0D1F1C',
    accent:  '#008B78',
    accent2: '#5B3CC4',
    muted:   'rgba(13,31,28,0.40)',
  },
  screens: [
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'metric', label: 'RUNNING TASKS',  value: '23',    sub: '6 agents active · 99.8% uptime' },
        { type: 'metric-row', items: [
          { label: 'Queued', value: '7' },
          { label: 'Errors', value: '1' },
          { label: 'Tokens', value: '510K' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Scout-7',  sub: 'Web Researcher · 14 tasks',  badge: 'ACTIVE'  },
          { icon: 'zap',      title: 'Forge-2',  sub: 'Code Generator · 3 tasks',   badge: 'BUSY'    },
          { icon: 'chart',    title: 'Prism-4',  sub: 'Data Analyst · 8 tasks',     badge: 'ACTIVE'  },
          { icon: 'eye',      title: 'Echo-1',   sub: 'Summariser · idle',          badge: 'IDLE'    },
          { icon: 'alert',    title: 'Veil-3',   sub: 'Security Monitor · error',   badge: 'ERROR'   },
          { icon: 'share',    title: 'Drift-9',  sub: 'API Orchestrator · 22 tasks',badge: 'ACTIVE'  },
        ]},
        { type: 'progress', items: [
          { label: 'Forge-2 CPU', pct: 91 },
          { label: 'Drift-9 CPU', pct: 67 },
          { label: 'Scout-7 CPU', pct: 72 },
        ]},
      ],
    },
    {
      id: 'agent', label: 'Agent',
      content: [
        { type: 'metric', label: 'FORGE-2  ·  CODE GENERATOR', value: 'BUSY',  sub: 'claude-3-7-sonnet · 204K tokens used' },
        { type: 'metric-row', items: [
          { label: 'CPU',    value: '91%'  },
          { label: 'Memory', value: '2.1G' },
          { label: 'Tokens', value: '204K' },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Analyse repo codebase',      sub: '✓ done · 2m 14s · 42K tokens',  badge: 'DONE'    },
          { icon: 'zap',    title: 'Generate refactor proposal',  sub: '⏳ running · 0m 38s · 98K',     badge: 'RUN'     },
          { icon: 'list',   title: 'Write unit tests',           sub: 'queued · awaiting handoff',      badge: 'QUEUE'   },
          { icon: 'share',  title: 'Submit PR summary',          sub: 'queued · awaiting Forge-2',      badge: 'QUEUE'   },
        ]},
        { type: 'text', label: 'Context Window', value: '128K window · 204K used (159%) → chunking active' },
        { type: 'tags', label: 'Model', items: ['claude-3-7-sonnet-20250219', 'chunk-mode', 'parallel-tools'] },
      ],
    },
    {
      id: 'feed', label: 'Feed',
      content: [
        { type: 'metric', label: 'MISSION FEED', value: '38/h', sub: 'Events per hour · filter: ALL' },
        { type: 'list', items: [
          { icon: 'search',   title: 'Scout-7  TOOL_CALL',   sub: 'web_search("AI agent frameworks 2026")', badge: '09:41' },
          { icon: 'code',     title: 'Forge-2  THINKING',    sub: 'Planning refactor for auth module…',     badge: '09:41' },
          { icon: 'share',    title: 'Drift-9  API_CALL',    sub: 'POST /v1/pipelines/trigger → 200 OK',   badge: '09:41' },
          { icon: 'chart',    title: 'Prism-4  RESULT',      sub: 'Anomaly score: 0.92 → flagged',         badge: '09:41' },
          { icon: 'alert',    title: 'Veil-3   ERROR',       sub: 'SSL cert expired — halting task',       badge: '09:41' },
          { icon: 'check',    title: 'Echo-1   OUTPUT',      sub: 'Summary: 420 words, 3 findings',        badge: '09:41' },
        ]},
        { type: 'tags', label: 'Filter', items: ['ALL', 'ERRORS', 'TOOL_CALL', 'OUTPUT', 'API_CALL'] },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1' },
          { label: 'Warnings', value: '2' },
          { label: 'Info',     value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: '🔴  SSL certificate expired',        sub: 'Veil-3 · 3m ago · Agent halted',           badge: 'CRIT'  },
          { icon: 'alert',    title: '🟡  Context window overflow',        sub: 'Forge-2 · 7m ago · 204K / 128K limit',     badge: 'WARN'  },
          { icon: 'alert',    title: '🟡  High CPU sustained 5+ min',     sub: 'Forge-2 · 12m ago · 91% avg',              badge: 'WARN'  },
          { icon: 'eye',      title: 'ℹ  Anomaly detected in dataset',   sub: 'Prism-4 · 19m ago · Score 0.92',           badge: 'INFO'  },
          { icon: 'share',    title: 'ℹ  Task delegation spike',          sub: 'Drift-9 · 34m ago · 4 tasks in 2 min',     badge: 'INFO'  },
        ]},
        { type: 'text', label: 'Tip', value: 'Acknowledge resolved alerts to keep the feed clean. Critical alerts page on-call if left open > 15 min.' },
      ],
    },
    {
      id: 'orchestrate', label: 'Orchestrate',
      content: [
        { type: 'metric', label: 'PIPELINE',  value: 'v2.4',  sub: 'daily-research-pipeline · ACTIVE' },
        { type: 'list', items: [
          { icon: 'zap',     title: 'TRIGGER',  sub: 'Cron 0 9 * * *',    badge: '→' },
          { icon: 'search',  title: 'Scout-7',  sub: 'Web Research',       badge: '→' },
          { icon: 'chart',   title: 'Prism-4',  sub: 'Analyse Data',       badge: '↓' },
          { icon: 'code',    title: 'Forge-2',  sub: 'Generate Code',      badge: '↓' },
          { icon: 'eye',     title: 'Echo-1',   sub: 'Summarise',          badge: '→' },
          { icon: 'check',   title: 'OUTPUT',   sub: 'PR + Report',        badge: '✓' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Last Run',  value: '4m 32s' },
          { label: 'Tokens',    value: '384K'   },
          { label: 'Next',      value: '09:00'  },
        ]},
        { type: 'progress', items: [
          { label: 'Scout-7 pipeline share', pct: 28 },
          { label: 'Forge-2 pipeline share', pct: 44 },
          { label: 'Prism-4 pipeline share', pct: 18 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'fleet',       label: 'Fleet',       icon: 'layers'   },
    { id: 'agent',       label: 'Agent',        icon: 'user'     },
    { id: 'feed',        label: 'Feed',         icon: 'zap'      },
    { id: 'alerts',      label: 'Alerts',       icon: 'alert'    },
    { id: 'orchestrate', label: 'Orchestrate',  icon: 'grid'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'nerve-mock', 'NERVE — Interactive Mock');
console.log('Mock live at:', result.url);
