import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ORION',
  tagline:   'See every signal. Miss nothing.',
  archetype: 'developer-tools',
  palette: {
    bg:      '#080B10',
    surface: '#0D1117',
    text:    '#E2E8F0',
    accent:  '#0ED9C7',
    accent2: '#F4A228',
    muted:   'rgba(148,163,184,0.45)',
  },
  lightPalette: {
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#D97706',
    muted:   'rgba(15,23,42,0.45)',
  },
  screens: [
    {
      id: 'mission',
      label: 'Mission Control',
      content: [
        { type: 'metric', label: 'System Uptime', value: '99.97%', sub: '30-day rolling average' },
        { type: 'metric-row', items: [
          { label: 'Services Online', value: '23' },
          { label: 'Active Incidents', value: '2' },
          { label: 'Deploys Today', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'api-gateway', sub: 'p99: 42ms · 99.9% healthy', badge: '●' },
          { icon: 'activity', title: 'auth-service', sub: 'p99: 8ms · 100% healthy', badge: '●' },
          { icon: 'alert', title: 'payment-svc', sub: 'p99: 213ms · DEGRADED', badge: '!' },
          { icon: 'activity', title: 'db-primary', sub: 'p99: 3ms · 100% healthy', badge: '●' },
          { icon: 'alert', title: 'cache-layer', sub: 'p99: 891ms · CRITICAL', badge: '!!' },
        ]},
        { type: 'tags', label: 'Active Incidents', items: ['P1 cache OOMKill', 'P3 payment err rate'] },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '26' },
          { label: 'Healthy', value: '24' },
          { label: 'Critical', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'api-gateway', sub: '4 replicas · us-east-1 · 12,847 req/s', badge: '✓' },
          { icon: 'lock', title: 'auth-svc', sub: 'JWT · OAuth2 · p99: 8ms', badge: '✓' },
          { icon: 'alert', title: 'payment-svc', sub: 'Stripe · Braintree · DEGRADED', badge: '⚠' },
          { icon: 'layers', title: 'cache-layer', sub: 'Redis 7.2 · OOMKilled', badge: '✕' },
          { icon: 'search', title: 'search-index', sub: 'Elasticsearch 8 · 3 nodes · 11ms', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'api-gateway health', pct: 99 },
          { label: 'payment-svc health', pct: 87 },
          { label: 'cache-layer health', pct: 42 },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Firing', value: '3' },
          { label: 'Silenced', value: '1' },
          { label: 'Resolved 24h', value: '11' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'INC-0412 P1 · cache-layer', sub: 'OOMKilled — container restarting · 2m', badge: '🔴' },
          { icon: 'alert', title: 'INC-0411 P2 · cache-layer', sub: 'Memory usage > 90% for 5 min · 23m', badge: '🔴' },
          { icon: 'alert', title: 'INC-0409 P3 · payment-svc', sub: 'Error rate exceeded 4% threshold · 1h', badge: '🟡' },
          { icon: 'check', title: 'INC-0408 P3 · api-gateway', sub: 'Latency p99 spike to 340ms · RESOLVED', badge: '✓' },
          { icon: 'check', title: 'INC-0407 P2 · auth-service', sub: 'JWT rotation lag > 30s · RESOLVED', badge: '✓' },
        ]},
        { type: 'tags', label: 'Affected Services', items: ['cache-layer', 'payment-svc', 'api-gateway'] },
      ],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      content: [
        { type: 'metric', label: 'Latency p99', value: '42ms', sub: 'api-gateway · ↓ 18% vs 24h ago' },
        { type: 'metric-row', items: [
          { label: 'Error Rate', value: '0.12%' },
          { label: 'Throughput', value: '12.8K/s' },
          { label: 'Apdex', value: '0.97' },
        ]},
        { type: 'progress', items: [
          { label: 'Success rate', pct: 99 },
          { label: 'Cache hit rate', pct: 82 },
          { label: 'DB connection pool', pct: 47 },
          { label: 'CPU utilization', pct: 34 },
          { label: 'Memory pressure', pct: 91 },
        ]},
        { type: 'text', label: 'Anomaly Detected', value: 'cache-layer memory climbing since 04:12 UTC. Pattern matches OOM event from 2024-11-03. Consider pre-emptive restart.' },
      ],
    },
    {
      id: 'deploys',
      label: 'Deployments',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today', value: '14' },
          { label: 'Success', value: '92%' },
          { label: 'Rollbacks', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway v2.14.1', sub: 'a3f9e2b · mia.k · 3m 48s · 3 min ago', badge: '✓' },
          { icon: 'check', title: 'auth-service v1.8.3', sub: '7c2d5a1 · dev-bot · 2m 12s · 28 min ago', badge: '✓' },
          { icon: 'check', title: 'search-index v3.1.0', sub: 'e8b4f3c · tom.r · 6m 02s · 1h ago', badge: '✓' },
          { icon: 'alert', title: 'payment-svc v4.2.0', sub: '9d1a8e5 · ci/cd · 4m 55s · NOW DEGRADED', badge: '⚠' },
          { icon: 'alert', title: 'cache-layer v1.3.2', sub: 'c8a5f1e · ci/cd · ROLLED BACK · 5h ago', badge: '✕' },
        ]},
        { type: 'text', label: 'Avg Deploy Time', value: '4m 12s across all services. Fastest: notif-svc 1m 38s. Slowest: db-migrations 8m 21s.' },
      ],
    },
    {
      id: 'oncall',
      label: 'On-Call',
      content: [
        { type: 'metric', label: 'Current Primary', value: 'Mia Kim', sub: 'Platform Engineering · Handoff in 06:14:38' },
        { type: 'list', items: [
          { icon: 'user', title: 'L1 · Mia Kim (Primary)', sub: 'Responds immediately · +1 (415) 555-0124', badge: '◉' },
          { icon: 'user', title: 'L2 · Tom Reyes (Secondary)', sub: 'Escalates after 15 min', badge: '○' },
          { icon: 'user', title: 'L3 · Sam Lim (Manager)', sub: 'Escalates after 30 min', badge: '○' },
          { icon: 'user', title: 'L4 · CTO Bridge (Executive)', sub: 'Escalates after 60 min', badge: '○' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Open Incidents', value: '2' },
          { label: 'Acked', value: '1' },
          { label: 'MTTR 30d', value: '14m' },
        ]},
        { type: 'tags', label: 'Week 15 Rotation', items: ['Mia K', 'Tom R', 'Sam L', 'Dev Bot'] },
      ],
    },
  ],
  nav: [
    { id: 'mission',  label: 'Mission',  icon: 'home' },
    { id: 'services', label: 'Services', icon: 'layers' },
    { id: 'alerts',   label: 'Alerts',   icon: 'alert' },
    { id: 'metrics',  label: 'Metrics',  icon: 'activity' },
    { id: 'deploys',  label: 'Deploy',   icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'orion-mock', 'ORION — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
