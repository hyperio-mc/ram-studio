import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BEAM',
  tagline:   'Pinpoint every fault before it cascades',
  archetype: 'devops-observability',
  palette: {
    bg:      '#090D1A',
    surface: '#0D1220',
    text:    '#E2E8F0',
    accent:  '#00D4FF',
    accent2: '#FF5B35',
    muted:   'rgba(148,163,184,0.55)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#EA4C2A',
    muted:   'rgba(15,23,42,0.45)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '99.97%' },
          { label: 'P99 Lat', value: '142ms' },
          { label: 'Err Rate', value: '0.03%' },
        ]},
        { type: 'metric', label: 'Requests / Min', value: '8,420', sub: '↑ 340 vs 1h ago' },
        { type: 'progress', items: [
          { label: 'api-gateway', pct: 100 },
          { label: 'auth-service', pct: 98 },
          { label: 'cart-service', pct: 72 },
          { label: 'pricing-engine', pct: 55 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'api-gateway', sub: '2,340/s · 98ms P99', badge: '✓' },
          { icon: 'activity', title: 'auth-service', sub: '1,820/s · 45ms P99', badge: '✓' },
          { icon: 'alert', title: 'data-pipeline', sub: '940/s · 312ms P99', badge: '⚠' },
          { icon: 'activity', title: 'notification', sub: '620/s · 67ms P99', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'traces',
      label: 'Traces',
      content: [
        { type: 'metric', label: 'Active Traces', value: '2,847', sub: 'last 60 seconds' },
        { type: 'tags', label: 'Filter', items: ['All', 'Error', '>200ms', 'Critical'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'POST /api/checkout', sub: 'trace_7f2a1c · 524ms', badge: 'SLOW' },
          { icon: 'check', title: 'GET /api/products', sub: 'trace_9d4b2f · 38ms', badge: 'OK' },
          { icon: 'alert', title: 'PUT /api/user/cart', sub: 'trace_3e8a1d · 891ms', badge: 'ERR' },
          { icon: 'check', title: 'POST /api/auth', sub: 'trace_1c9f7a · 42ms', badge: 'OK' },
          { icon: 'check', title: 'GET /api/inventory', sub: 'trace_5b2e4c · 67ms', badge: 'OK' },
        ]},
        { type: 'progress', items: [
          { label: 'api-gateway span', pct: 100 },
          { label: 'auth-service span', pct: 8 },
          { label: 'cart-service span', pct: 55 },
          { label: 'pricing-engine', pct: 32 },
          { label: 'payment-svc span', pct: 30 },
        ]},
      ],
    },
    {
      id: 'graph',
      label: 'Graph',
      content: [
        { type: 'metric-row', items: [
          { label: 'Nodes', value: '24' },
          { label: 'Edges', value: '38' },
          { label: 'Alerts', value: '2' },
        ]},
        { type: 'text', label: 'Topology Status', value: 'cart-service → pricing-engine edge showing elevated latency. 2 degraded paths detected in the dependency graph.' },
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway', sub: 'Core · 8,420 req/min', badge: '✓' },
          { icon: 'check', title: 'auth-service', sub: 'Auth · 1,820 req/min', badge: '✓' },
          { icon: 'alert', title: 'cart-service', sub: 'Commerce · Degraded', badge: '⚠' },
          { icon: 'alert', title: 'pricing-engine', sub: 'Commerce · High P99', badge: '⚠' },
          { icon: 'check', title: 'payment-svc', sub: 'Payments · 920 req/min', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'incidents',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '2' },
          { label: 'Warning', value: '5' },
          { label: 'Info', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'pricing-engine P99 > 200ms', sub: 'CRITICAL · 4m ago', badge: '🔴' },
          { icon: 'alert', title: 'cart-service 5xx elevated', sub: 'CRITICAL · 18m ago', badge: '🔴' },
          { icon: 'alert', title: 'inventory-db slow queries', sub: 'WARNING · 1h ago', badge: '🟡' },
          { icon: 'alert', title: 'auth token refresh rate +42%', sub: 'WARNING · 2h ago', badge: '🟡' },
          { icon: 'eye', title: 'notification queue depth', sub: 'INFO · 3h ago', badge: '🔵' },
        ]},
        { type: 'text', label: 'On-Call', value: 'Alex K. is currently on-call. Auto-escalation triggers in 8 minutes if CRITICAL incidents are unacknowledged.' },
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      content: [
        { type: 'metric', label: 'Health Score', value: '97.4', sub: '↑ 2.1 pts vs last week · /100' },
        { type: 'progress', items: [
          { label: 'Availability SLO · target 99.9%', pct: 99.97 },
          { label: 'P99 Latency SLO · target 95%', pct: 96.4 },
          { label: 'Error Rate SLO · target 99%', pct: 87.2 },
          { label: 'P50 Latency SLO · target 98%', pct: 99.1 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Incidents', value: '21' },
          { label: 'MTTR', value: '4.2h' },
          { label: 'Deploys', value: '34' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'api-gateway', sub: '8,420/min · 98ms avg', badge: '↑' },
          { icon: 'chart', title: 'cart-service', sub: '4,620/min · 189ms avg', badge: '↓' },
          { icon: 'chart', title: 'auth-service', sub: '3,620/min · 45ms avg', badge: '↑' },
        ]},
      ],
    },
    {
      id: 'config',
      label: 'Config',
      content: [
        { type: 'text', label: 'Workspace', value: 'Acme Corp · Pro plan · 5 members + 8 more' },
        { type: 'list', items: [
          { icon: 'zap', title: 'PagerDuty', sub: 'Alert routing & on-call', badge: '✓' },
          { icon: 'message', title: 'Slack', sub: '#ops-alerts channel', badge: '✓' },
          { icon: 'eye', title: 'DataDog', sub: 'Metrics forwarding active', badge: '✓' },
          { icon: 'code', title: 'GitHub', sub: 'Deploy tracking — not connected', badge: '○' },
          { icon: 'layers', title: 'Jira', sub: 'Incident tickets — not connected', badge: '○' },
        ]},
        { type: 'tags', label: 'Alert Thresholds', items: ['Err >0.1%', 'P99 >200ms', 'CPU >80%'] },
        { type: 'metric-row', items: [
          { label: 'Data Retention', value: '90d' },
          { label: 'Sampling', value: '100%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',    label: 'Overview',  icon: 'home' },
    { id: 'traces',      label: 'Traces',    icon: 'activity' },
    { id: 'graph',       label: 'Graph',     icon: 'grid' },
    { id: 'incidents',   label: 'Alerts',    icon: 'bell' },
    { id: 'performance', label: 'Perf',      icon: 'chart' },
    { id: 'config',      label: 'Config',    icon: 'settings' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'beam-mock', 'BEAM — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/beam-mock`);
