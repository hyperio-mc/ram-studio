import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SIGMA',
  tagline:   'Pattern before failure.',
  archetype: 'devops-monitoring',

  palette: {           // DARK theme — Neon.com inspired: pure black + electric green
    bg:      '#060708',
    surface: '#0C0E14',
    text:    '#E8EDF5',
    accent:  '#00E599',
    accent2: '#F59E0B',
    muted:   'rgba(232,237,245,0.45)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F4F6F8',
    surface: '#FFFFFF',
    text:    '#0C1018',
    accent:  '#007A52',
    accent2: '#C07800',
    muted:   'rgba(12,16,24,0.5)',
  },

  screens: [
    {
      id: 'monitor', label: 'Monitor',
      content: [
        { type: 'metric', label: 'Overall SLO', value: '99.94%', sub: '30-day · error budget 62% remaining' },
        { type: 'metric-row', items: [
          { label: 'API p99',    value: '42ms'  },
          { label: 'DB p99',    value: '6ms'   },
          { label: 'Error Rate', value: '0.02%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'API Gateway',  sub: '4,241 rps · p99 42ms',  badge: '✓' },
          { icon: 'check', title: 'Auth Service', sub: '1,802 rps · p99 18ms',  badge: '✓' },
          { icon: 'check', title: 'Database',     sub: '9,103 rps · p99 6ms',   badge: '✓' },
          { icon: 'alert', title: 'Queue Worker', sub: '340 rps · p99 180ms',   badge: '!' },
          { icon: 'alert', title: 'ML Inference', sub: '88 rps · p99 310ms',    badge: '!' },
        ]},
        { type: 'text', label: 'Active Incidents', value: '2 incidents open — P2 queue latency spike (23m), P3 ML cold start increase (1h 4m).' },
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Healthy', 'Degraded', 'Down'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'API Gateway',  sub: 'prod-us-east · 0.02% errors',  badge: '●' },
          { icon: 'activity', title: 'Auth Service', sub: 'prod-us-east · 0.01% errors',  badge: '●' },
          { icon: 'activity', title: 'Database',     sub: 'prod-us-east · 0.00% errors',  badge: '●' },
          { icon: 'alert',    title: 'Queue Worker', sub: 'prod-us-east · 0.12% errors',  badge: '▲' },
          { icon: 'alert',    title: 'ML Inference', sub: 'prod-us-west · 0.08% errors',  badge: '▲' },
          { icon: 'activity', title: 'Email Worker', sub: 'prod-eu · 0.00% errors',       badge: '●' },
        ]},
        { type: 'progress', items: [
          { label: 'API Gateway uptime',   pct: 99  },
          { label: 'Database uptime',      pct: 100 },
          { label: 'Queue Worker uptime',  pct: 82  },
          { label: 'ML Inference uptime',  pct: 91  },
        ]},
      ],
    },
    {
      id: 'traces', label: 'Traces',
      content: [
        { type: 'metric-row', items: [
          { label: 'Traced/min', value: '340'   },
          { label: 'Avg dur',   value: '44ms'  },
          { label: 'Error pct', value: '0.12%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'POST /api/ingest',   sub: 'trc_8f3a2b · 342ms · queue.push slow',    badge: '!' },
          { icon: 'check', title: 'GET /api/events',    sub: 'trc_1c9d4e · 22ms · cache hit',           badge: '✓' },
          { icon: 'alert', title: 'POST /api/ml/score', sub: 'trc_7e5f0a · 418ms · ml cold start',      badge: '!' },
          { icon: 'check', title: 'GET /api/users',     sub: 'trc_2a1b3c · 14ms · fast path',           badge: '✓' },
          { icon: 'check', title: 'PUT /api/config',    sub: 'trc_9d8e7f · 38ms · db write',            badge: '✓' },
        ]},
        { type: 'text', label: 'AI Insight', value: 'queue.push spans account for 84% of total request duration on /api/ingest. This correlates with the current P2 incident.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1'  },
          { label: 'Warning',  value: '2'  },
          { label: 'Info',     value: '2'  },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'P1 · Error rate > 5%',              sub: 'queue-worker · 2m ago · unacknowledged', badge: '🔴' },
          { icon: 'alert', title: 'P2 · Latency p99 > 200ms',          sub: 'queue-worker · 23m ago',                badge: '🟠' },
          { icon: 'alert', title: 'P2 · ML cold start rate elevated',   sub: 'ml-inference · 1h 4m · acked',          badge: '🟠' },
          { icon: 'bell',  title: 'P3 · Disk usage > 75%',             sub: 'db-replica-2 · 2h 10m · acked',         badge: '🟡' },
          { icon: 'bell',  title: 'P3 · Cache hit ratio < 90%',        sub: 'cache-layer · 3h 40m · acked',          badge: '🟡' },
        ]},
        { type: 'text', label: 'Runbook', value: 'P1 queue-worker: Scale worker pool from 4 → 8 replicas. Check dead letter queue depth. Page on-call if no improvement in 5m.' },
      ],
    },
    {
      id: 'deploys', label: 'Deploys',
      content: [
        { type: 'metric', label: 'Latest Deploy', value: 'v2.14.0', sub: 'Auth token refresh optimization · elena · 14m ago · no impact' },
        { type: 'metric-row', items: [
          { label: 'Today',    value: '4'    },
          { label: 'Rollback', value: '1'    },
          { label: 'MTTD',     value: '1.8m' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'v2.14.0 · Auth token refresh',      sub: 'elena · 14m ago · no impact',    badge: '✓' },
          { icon: 'check', title: 'v2.13.2 · Fix ML timeout config',   sub: 'omar · 6h ago · no impact',     badge: '✓' },
          { icon: 'check', title: 'v2.13.1 · Rollback: revert queue',  sub: 'system · 9h ago · improved',   badge: '↩' },
          { icon: 'zap',   title: 'v2.13.0 · Queue worker refactor',   sub: 'kai · 11h ago · spike +180%',  badge: '⚡' },
          { icon: 'check', title: 'v2.12.5 · Dependency bumps',        sub: 'elena · 1d ago · no impact',   badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Deploy health (last 7d)', pct: 80 },
          { label: 'Rollback rate',           pct: 20 },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'monitor',  label: 'Monitor',  icon: 'activity' },
    { id: 'services', label: 'Services', icon: 'grid'     },
    { id: 'traces',   label: 'Traces',   icon: 'layers'   },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell'     },
    { id: 'deploys',  label: 'Deploys',  icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sigma-mock', 'SIGMA — Interactive Mock');
console.log('Mock live at:', result.url);
