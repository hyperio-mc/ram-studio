import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Forge',
  tagline: 'Infrastructure command center for engineering teams',
  archetype: 'devtools-monitor',
  palette: {
    bg:      '#060A0F',
    surface: '#0D1520',
    text:    '#E2E8F0',
    accent:  '#22D3EE',
    accent2: '#818CF8',
    muted:   'rgba(100,116,139,0.5)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#6366F1',
    muted:   'rgba(71,85,105,0.5)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'System Health', value: '98.7%', sub: 'All services' },
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '99.98%' },
          { label: 'Incidents', value: '1 open' },
          { label: 'P99', value: '142ms' }
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'postgres-primary', sub: 'us-east-1 · 14ms', badge: 'healthy' },
          { icon: 'check', title: 'api-gateway', sub: 'edge · 8ms', badge: 'healthy' },
          { icon: 'alert', title: 'worker-queue', sub: 'us-east-1 · 847 jobs/min', badge: 'degraded' },
          { icon: 'check', title: 'cdn-edge', sub: 'global · 99.99% cache', badge: 'healthy' },
        ]},
        { type: 'text', label: 'Active Alert', value: 'Worker queue backlog elevated — processing rate dropped 23% over last 15 min. 1,847 jobs pending.' },
      ],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      content: [
        { type: 'metric', label: 'Request Rate', value: '94', sub: 'req/s — ↑ +8% vs avg' },
        { type: 'metric-row', items: [
          { label: 'P50', value: '42ms' },
          { label: 'P99', value: '142ms' },
          { label: 'Errors', value: '0.03%' }
        ]},
        { type: 'progress', items: [
          { label: 'api-gateway', pct: 40 },
          { label: 'postgres-primary', pct: 31 },
          { label: 'cdn-edge', pct: 19 },
          { label: 'worker-queue', pct: 10 },
        ]},
        { type: 'tags', label: 'Time Range', items: ['15m', '1h', '6h', '24h', '7d'] },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open', value: '2' },
          { label: 'Resolved', value: '2' },
          { label: 'MTTR', value: '18m' }
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Worker queue backlog elevated', sub: 'P2 · worker-queue · 3 min ago', badge: 'open' },
          { icon: 'alert', title: 'P99 latency spike: api-gateway', sub: 'P3 · api-gateway · 18 min ago', badge: 'open' },
          { icon: 'check', title: 'Disk usage: postgres replica', sub: 'P2 · resolved · 2 hr ago', badge: 'done' },
          { icon: 'check', title: 'CDN cache hit rate low', sub: 'P3 · resolved · 6 hr ago', badge: 'done' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Open', 'P1', 'P2', 'Resolved'] },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '4' },
          { label: 'Healthy', value: '3' },
          { label: 'Degraded', value: '1' }
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'postgres-primary', sub: 'Database · us-east-1 · v16.2', badge: '14ms' },
          { icon: 'zap', title: 'api-gateway', sub: 'API · edge 7 regions · v3.1.4', badge: '8ms' },
          { icon: 'alert', title: 'worker-queue', sub: 'Worker · us-east-1 · v2.7.1', badge: 'degraded' },
          { icon: 'eye', title: 'cdn-edge', sub: 'CDN · global · v1.4.0', badge: '99.99%' },
        ]},
        { type: 'text', label: 'Last synced', value: 'Service topology updated 30 seconds ago. 4 services registered, 1 degraded.' },
      ],
    },
    {
      id: 'ai',
      label: 'AI',
      content: [
        { type: 'text', label: 'Forge AI', value: 'Detected: worker-queue backlog elevated. Processing rate dropped 23% — likely linked to job surge after the 09:18 deploy.' },
        { type: 'text', label: 'Suggestion', value: 'JWT verification is CPU-bound on /auth. Enable token caching (TTL 5min) to reduce P99 latency ~40%.' },
        { type: 'metric-row', items: [
          { label: 'Incidents 24h', value: '4' },
          { label: 'MTTR', value: '18m' },
          { label: 'P1s', value: '0' }
        ]},
        { type: 'tags', label: 'Quick queries', items: ['Root cause?', 'Memory usage', 'SLO status', 'Last deploy'] },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'metrics', label: 'Metrics', icon: 'activity' },
    { id: 'alerts', label: 'Alerts', icon: 'bell' },
    { id: 'services', label: 'Services', icon: 'layers' },
    { id: 'ai', label: 'AI', icon: 'message' },
  ],
};

console.log('Generating Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Building mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

console.log('Publishing mock...');
const result = await publishMock(html, 'forge-mock', 'Forge — Interactive Mock');
console.log('Mock live at:', result.url);
