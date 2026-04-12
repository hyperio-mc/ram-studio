import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'VELA',
  tagline: 'Query the edge. Instantly.',
  archetype: 'edge-analytics',
  palette: {
    bg: '#111111',
    surface: '#191818',
    text: '#F6F4F1',
    accent: '#00E599',
    accent2: '#00B377',
    muted: 'rgba(246,244,241,0.38)',
  },
  lightPalette: {
    bg: '#F6F4F1',
    surface: '#FFFFFF',
    text: '#111111',
    accent: '#007A52',
    accent2: '#005C3D',
    muted: 'rgba(17,17,17,0.38)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Events Today', value: '2.4B', sub: '↑ 18.2% from yesterday' },
        { type: 'metric-row', items: [{ label: 'Latency', value: '0.8ms' }, { label: 'Queries/s', value: '142K' }, { label: 'Uptime', value: '99.99%' }] },
        { type: 'progress', items: [
          { label: 'api.request', pct: 68 },
          { label: 'db.query', pct: 51 },
          { label: 'auth.login', pct: 29 },
          { label: 'cache.hit', pct: 19 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'POST /v1/ingest', sub: '0.8ms · now', badge: '200' },
          { icon: 'code', title: 'SELECT count(*) FROM events', sub: '2.1ms · 1s ago', badge: 'SQL' },
          { icon: 'lock', title: 'POST /v1/auth/token', sub: '4.9ms · 2s ago', badge: '200' },
        ]},
      ],
    },
    {
      id: 'query',
      label: 'Query',
      content: [
        { type: 'text', label: 'Active Query', value: 'SELECT event_type, count(*) AS total, avg(duration_ms) FROM events GROUP BY event_type' },
        { type: 'metric-row', items: [{ label: 'Rows', value: '1,204' }, { label: 'Time', value: '12ms' }, { label: 'Scanned', value: '8.2M' }] },
        { type: 'list', items: [
          { icon: 'zap', title: 'api.request', sub: '1,840,293 events', badge: '0.8ms' },
          { icon: 'zap', title: 'db.query', sub: '924,182 events', badge: '2.1ms' },
          { icon: 'zap', title: 'auth.login', sub: '241,087 events', badge: '4.9ms' },
        ]},
        { type: 'tags', label: 'Saved Queries', items: ['Daily Active', 'P99 Latency', 'Error Rate', 'Region Split'] },
      ],
    },
    {
      id: 'events',
      label: 'Events',
      content: [
        { type: 'metric-row', items: [{ label: 'Ingesting', value: '142K/s' }, { label: 'Queue', value: '0ms' }] },
        { type: 'tags', label: 'Filter', items: ['All', 'API', 'DB', 'Auth', 'Webhook'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'api.request POST /v1/ingest', sub: '0.8ms · now', badge: '200' },
          { icon: 'code', title: 'db.query SELECT events WHERE...', sub: '2.1ms · 1s ago', badge: 'SQL' },
          { icon: 'lock', title: 'auth.login POST /v1/auth', sub: '4.9ms · 2s ago', badge: '200' },
          { icon: 'alert', title: 'webhook.send hooks.zapier.com', sub: '18ms · 5s ago', badge: '404' },
          { icon: 'zap', title: 'cache.hit events:daily:cache', sub: '0.1ms · 6s ago', badge: 'HIT' },
        ]},
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      content: [
        { type: 'metric', label: 'Global P50 Latency', value: '1.2ms', sub: 'Avg across 48 regions' },
        { type: 'metric-row', items: [{ label: 'Error Rate', value: '0.003%' }, { label: 'Throughput', value: '142K/s' }, { label: 'Cache Hit', value: '94.7%' }] },
        { type: 'list', items: [
          { icon: 'map', title: 'us-east-1 · N. Virginia', sub: 'p50 latency', badge: '0.6ms' },
          { icon: 'map', title: 'eu-west-1 · Ireland', sub: 'p50 latency', badge: '1.1ms' },
          { icon: 'map', title: 'ap-southeast-1 · Singapore', sub: 'p50 latency', badge: '2.3ms' },
          { icon: 'map', title: 'us-west-2 · Oregon', sub: 'p50 latency', badge: '0.8ms' },
        ]},
        { type: 'progress', items: [{ label: 'Global Health', pct: 99 }, { label: 'Edge Coverage', pct: 94 }] },
      ],
    },
    {
      id: 'usage',
      label: 'Usage',
      content: [
        { type: 'metric', label: 'Current Plan', value: '$49/mo', sub: 'Pro · Renews May 11, 2026' },
        { type: 'progress', items: [
          { label: 'Events Ingested (2.4B / 10B)', pct: 24 },
          { label: 'Query Compute (142K / 500K req)', pct: 28 },
          { label: 'Data Storage (18.2GB / 100GB)', pct: 18 },
          { label: 'API Calls (89K / 250K)', pct: 36 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'April 2026', sub: 'Due May 1', badge: 'Pending' },
          { icon: 'check', title: 'March 2026', sub: 'Paid Mar 1', badge: '$49' },
          { icon: 'check', title: 'February 2026', sub: 'Paid Feb 1', badge: '$49' },
        ]},
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'text', label: 'Project', value: 'acme-production · us-east-1 · PostgreSQL 16' },
        { type: 'list', items: [
          { icon: 'lock', title: 'Production Key', sub: 'vela_prod_••••••4f2a', badge: 'Active' },
          { icon: 'lock', title: 'Development Key', sub: 'vela_dev_••••••8c19', badge: 'Active' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Lena Marchetti', sub: 'lena@acme.io', badge: 'Owner' },
          { icon: 'user', title: 'Josh Kim', sub: 'josh@acme.io', badge: 'Engineer' },
          { icon: 'user', title: 'Priya Nair', sub: 'priya@acme.io', badge: 'Analyst' },
        ]},
        { type: 'tags', label: 'Preferences', items: ['Notifications', 'Webhooks', 'Retention', 'SSO'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'query', label: 'Query', icon: 'code' },
    { id: 'events', label: 'Events', icon: 'activity' },
    { id: 'performance', label: 'Perf', icon: 'chart' },
    { id: 'usage', label: 'Usage', icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vela2-mock', 'VELA — Interactive Mock');
console.log('Mock live at:', result.url);
