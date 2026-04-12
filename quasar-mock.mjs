import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'QUASAR',
  tagline:   'Watch your agents think',
  archetype: 'devtools-agent-monitoring',
  palette: {
    bg:      '#0A0C12',
    surface: '#111420',
    text:    '#E8EAEF',
    accent:  '#8B6FEE',
    accent2: '#2CE5A8',
    muted:   'rgba(90,97,128,0.9)',
  },
  lightPalette: {
    bg:      '#F0F2F8',
    surface: '#FFFFFF',
    text:    '#0A0C1A',
    accent:  '#6B4FD8',
    accent2: '#0DB888',
    muted:   'rgba(80,90,120,0.5)',
  },
  screens: [
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'metric', label: 'Fleet Status', value: '4 Agents', sub: '2 active · 1 idle · 1 error' },
        { type: 'metric-row', items: [
          { label: 'Tasks Today', value: '2,759' },
          { label: 'Avg Tok/s',   value: '8.5k'  },
          { label: 'Spend',       value: '$0.83'  },
        ] },
        { type: 'list', items: [
          { icon: 'activity', title: 'scout-01',   sub: 'ACTIVE · 9.2k tok/s · $0.42',  badge: '●' },
          { icon: 'activity', title: 'forge-02',   sub: 'ACTIVE · 7.8k tok/s · $0.31',  badge: '●' },
          { icon: 'alert',    title: 'relay-03',   sub: 'IDLE · queue empty · $0.08',    badge: '–' },
          { icon: 'alert',    title: 'cipher-04',  sub: 'ERROR · no heartbeat · $0.02',  badge: '!' },
        ] },
        { type: 'progress', items: [
          { label: 'scout-01 throughput', pct: 92 },
          { label: 'forge-02 throughput', pct: 78 },
        ] },
      ],
    },
    {
      id: 'observe', label: 'Observe',
      content: [
        { type: 'metric', label: 'scout-01', value: '9.2k tok/s', sub: 'shard: us-east-2 · runtime: 4h 12m' },
        { type: 'metric-row', items: [
          { label: 'Tasks Done', value: '1,482' },
          { label: 'P50 Latency', value: '148ms' },
          { label: 'Errors',      value: '3'     },
        ] },
        { type: 'tags', label: 'Model', items: ['FIG-003', 'v2.1.4', '128k ctx', '56% used'] },
        { type: 'progress', items: [
          { label: 'Context window (56%)', pct: 56 },
          { label: 'Cost vs target (82%)', pct: 82 },
        ] },
        { type: 'text', label: 'Latest Task #1482', value: 'Refactor auth middleware to use JWT refresh tokens — Completed · 2.3s · 4,820 tok' },
      ],
    },
    {
      id: 'tasks', label: 'Tasks',
      content: [
        { type: 'metric', label: 'Task Stream', value: '1,482', sub: 'tasks completed today across all agents' },
        { type: 'list', items: [
          { icon: 'check',  title: '#1482 scout-01',   sub: 'Refactor auth middleware → JWT · 2.3s · 4.8k tok',   badge: '✓' },
          { icon: 'check',  title: '#1481 forge-02',   sub: 'Generate OpenAPI spec for /payments · 4.1s · 9.2k',  badge: '✓' },
          { icon: 'check',  title: '#1480 scout-01',   sub: 'Write unit tests for UserService · 6.8s · 12.4k',    badge: '✓' },
          { icon: 'alert',  title: '#1478 cipher-04',  sub: 'Analyse dependency graph · FAILED',                  badge: '!' },
          { icon: 'check',  title: '#1477 scout-01',   sub: 'Improve CLI error messages · 1.9s · 3.2k tok',       badge: '✓' },
        ] },
      ],
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric', label: "Today's Spend", value: '$0.83', sub: '3.5% of $24.00 monthly limit' },
        { type: 'metric-row', items: [
          { label: 'Monthly Projection', value: '$8.20' },
          { label: 'Budget Remaining',   value: '$23.17' },
          { label: 'Savings vs Budget',  value: '66%'   },
        ] },
        { type: 'progress', items: [
          { label: 'scout-01 — $0.42 (51%)', pct: 51 },
          { label: 'forge-02 — $0.31 (37%)', pct: 37 },
          { label: 'relay-03 — $0.08 (10%)', pct: 10 },
          { label: 'cipher-04 — $0.02 (2%)', pct: 2  },
        ] },
        { type: 'text', label: 'Projection', value: '$8.20/mo projected — 66% under $24.00 budget at current run rate.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '2', sub: '1 critical · 1 warning · 1 info · 1 resolved' },
        { type: 'list', items: [
          { icon: 'alert',  title: 'CRITICAL — cipher-04 unresponsive', sub: 'No heartbeat 47m. Auto-restart failed ×3.',     badge: '⚠' },
          { icon: 'alert',  title: 'WARNING — forge-02 latency spike',  sub: 'P95 > 2,000ms for 8 consecutive tasks.',         badge: '!' },
          { icon: 'eye',    title: 'INFO — scout-01 context at 56%',    sub: 'Above 50% threshold. Consider splitting task.',   badge: 'i' },
          { icon: 'check',  title: 'RESOLVED — relay-03 queue drained', sub: 'Queue empty at 07:14 UTC. Idle state.',           badge: '✓' },
        ] },
      ],
    },
  ],
  nav: [
    { id: 'fleet',   label: 'Fleet',   icon: 'grid'     },
    { id: 'observe', label: 'Observe', icon: 'eye'      },
    { id: 'tasks',   label: 'Tasks',   icon: 'list'     },
    { id: 'budget',  label: 'Budget',  icon: 'chart'    },
    { id: 'alerts',  label: 'Alerts',  icon: 'bell'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'quasar-mock', 'QUASAR — Interactive Mock');
console.log('Mock live at:', result.url);
