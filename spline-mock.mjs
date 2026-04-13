import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPLINE',
  tagline:   'deployment intelligence, in real time',
  archetype: 'devops-observability',
  palette: {
    bg:      '#080B10',
    surface: '#0D1018',
    text:    '#E2E8F0',
    accent:  '#3B82F6',
    accent2: '#F59E0B',
    muted:   'rgba(100,116,139,0.6)',
  },
  lightPalette: {
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#2563EB',
    accent2: '#D97706',
    muted:   'rgba(15,23,42,0.45)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Uptime',       value: '99.97%' },
          { label: 'Deploys Today',value: '14'     },
          { label: 'P95 Latency',  value: '142ms'  },
          { label: 'Active Alerts',value: '2'      },
        ]},
        { type: 'text', label: 'System Status', value: 'All production services healthy. Worker-jobs reporting minor CPU elevation (94%). CDN edge latency nominal.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'api-gateway',  sub: 'prod · 99.9% uptime',  badge: '✓' },
          { icon: 'activity', title: 'auth-service',  sub: 'prod · 100% uptime',   badge: '✓' },
          { icon: 'alert',    title: 'worker-jobs',   sub: 'prod · 94.2% uptime',  badge: '⚡' },
          { icon: 'activity', title: 'cdn-edge',      sub: 'staging · 99.1% uptime',badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'api-gateway',  pct: 100 },
          { label: 'auth-service', pct: 100 },
          { label: 'worker-jobs',  pct: 94  },
          { label: 'cdn-edge',     pct: 99  },
        ]},
      ],
    },
    {
      id: 'deployments',
      label: 'Deploys',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today',    value: '14' },
          { label: 'Success',  value: '13' },
          { label: 'Failed',   value: '1'  },
          { label: 'Running',  value: '1'  },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway v2.4.1',  sub: 'main · 1m 42s · alex · 2m ago',  badge: 'prod'    },
          { icon: 'check', title: 'auth-service v1.9.3', sub: 'main · 1m 38s · sam · 18m ago',  badge: 'prod'    },
          { icon: 'play',  title: 'node deps update',    sub: 'main · 0m 52s… · pat · 1h ago',  badge: '▶'       },
          { icon: 'alert', title: 'dashboard redesign',  sub: 'dev · 0m 14s · alex · 2h ago',   badge: 'failed'  },
          { icon: 'check', title: 'worker memory fix',   sub: 'main · 1m 55s · sam · 3h ago',   badge: 'prod'    },
        ]},
        { type: 'tags', label: 'Environments', items: ['production', 'staging', 'preview', 'canary'] },
      ],
    },
    {
      id: 'errors',
      label: 'Errors',
      content: [
        { type: 'metric-row', items: [
          { label: 'New (24h)',  value: '47'  },
          { label: 'Resolved',  value: '183' },
          { label: 'Rate/min',  value: '0.8' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'TypeError',        sub: "Cannot read 'user' of undefined · 23×",   badge: 'crit' },
          { icon: 'alert', title: 'TimeoutError',     sub: 'DB connection pool exhausted · 8×',       badge: 'high' },
          { icon: 'alert', title: 'ValidationError',  sub: "Schema mismatch payload.items · 16×",     badge: 'med'  },
          { icon: 'alert', title: 'NetworkError',     sub: 'ECONNREFUSED :8080 · 4×',                 badge: 'low'  },
        ]},
        { type: 'progress', items: [
          { label: 'api-gateway errors',   pct: 65 },
          { label: 'auth-service errors',  pct: 22 },
          { label: 'worker-jobs errors',   pct: 44 },
          { label: 'cdn-edge errors',      pct: 11 },
        ]},
      ],
    },
    {
      id: 'performance',
      label: 'Perf',
      content: [
        { type: 'metric', label: 'Apdex Score', value: '0.91', sub: 'Excellent — exceeds 0.85 target' },
        { type: 'metric-row', items: [
          { label: 'p50',  value: '42ms'  },
          { label: 'p75',  value: '89ms'  },
          { label: 'p95',  value: '142ms' },
          { label: 'p99',  value: '389ms' },
        ]},
        { type: 'progress', items: [
          { label: 'p50  42ms',  pct: 42 },
          { label: 'p75  89ms',  pct: 68 },
          { label: 'p95  142ms', pct: 85 },
          { label: 'p99  389ms', pct: 95 },
        ]},
        { type: 'text', label: 'Throughput', value: 'Avg 380 req/s over last 24h. Up 12% vs last week. Peak 450 req/s at 14:30 UTC.' },
        { type: 'tags', label: 'Tracked Services', items: ['api-gateway', 'auth-service', 'worker-jobs', 'cdn-edge'] },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '2' },
          { label: 'Pending', value: '1' },
          { label: 'OK', value: '9' },
        ]},
        { type: 'text', label: 'Active Incident', value: 'CRITICAL: api-gateway error rate crossed 2% threshold. Started 4m ago. SEV-1 opened. Jordan acknowledged.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Error rate > 2%',     sub: '5m window · api-gateway · 4m ago',   badge: 'FIRE' },
          { icon: 'alert', title: 'CPU > 90%',           sub: '3m window · worker-jobs · 22m ago',  badge: 'FIRE' },
          { icon: 'bell',  title: 'Latency p95 > 300ms', sub: '10m window · api-gateway · pending', badge: '...'  },
          { icon: 'check', title: 'Deploy failures',     sub: '1h window · all services · resolved',badge: 'OK'   },
          { icon: 'check', title: 'Memory > 85%',        sub: '5m window · all services · ok',      badge: 'OK'   },
        ]},
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Online',   value: '5' },
          { label: 'On-call',  value: '1' },
          { label: 'Deploys',  value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',  title: 'alex',   sub: 'eng · deployed api-gateway v2.4.1 · 2m',  badge: '🟢' },
          { icon: 'zap',  title: 'sam',    sub: 'eng · merged PR #247 auth fix · 18m',      badge: '🟢' },
          { icon: 'user', title: 'pat',    sub: 'devops · scaled worker-jobs x8 · 24m',     badge: '🟡' },
          { icon: 'star', title: 'riley',  sub: 'eng · reviewing PR #251 · 1h',             badge: '🟢' },
          { icon: 'alert',title: 'jordan', sub: 'on-call · acked SEV-1 incident · 4m',      badge: '🔴' },
        ]},
        { type: 'text', label: 'Recent Activity', value: 'Jordan acknowledged CRITICAL alert. Pat scaled worker-jobs to handle load. Sam merged auth token fix to main.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',    label: 'Overview', icon: 'home'     },
    { id: 'deployments', label: 'Deploys',  icon: 'zap'      },
    { id: 'errors',      label: 'Errors',   icon: 'alert'    },
    { id: 'performance', label: 'Perf',     icon: 'activity' },
    { id: 'alerts',      label: 'Alerts',   icon: 'bell'     },
    { id: 'team',        label: 'Team',     icon: 'user'     },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'spline');
const result = await publishMock(built, 'spline-mock', 'SPLINE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/spline-mock`);
