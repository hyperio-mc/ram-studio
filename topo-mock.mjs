// topo-mock.mjs — Interactive Svelte mock for TOPO
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TOPO',
  tagline:   'Map your system\'s terrain',
  archetype: 'devops-observability-dark',
  palette: {
    bg:      '#090C0D',
    surface: '#111619',
    text:    '#C8E0DC',
    accent:  '#1EC8B0',
    accent2: '#F0924A',
    muted:   'rgba(30,200,176,0.25)',
  },
  lightPalette: {
    bg:      '#F0F5F5',
    surface: '#FFFFFF',
    text:    '#0A1A1A',
    accent:  '#0EA896',
    accent2: '#E07A38',
    muted:   'rgba(10,26,26,0.40)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'System Health', value: '98%', sub: 'All systems nominal' },
        { type: 'metric-row', items: [
          { label: 'CPU avg', value: '54%' },
          { label: 'Mem', value: '70%' },
          { label: 'Net', value: '380k/s' },
        ]},
        { type: 'tags', label: 'Active Services', items: ['api-gateway', 'auth', 'ml-inference', 'redis', '+10'] },
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway', sub: 'p99 · 42ms', badge: 'OK' },
          { icon: 'check', title: 'auth-service', sub: 'p99 · 18ms', badge: 'OK' },
          { icon: 'alert', title: 'data-pipeline', sub: 'p99 · 890ms — SLOW', badge: '⚠' },
          { icon: 'zap',   title: 'postgres-primary', sub: 'timeout — INCIDENT', badge: '!' },
        ]},
        { type: 'text', label: 'Active Incident', value: 'postgres-primary: connection pool exhausted · 23 min ago · @devops on-call' },
      ],
    },
    {
      id: 'metrics', label: 'Metrics',
      content: [
        { type: 'metric', label: 'Avg Latency', value: '2.4ms', sub: 'Last 6 hours' },
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '99.8%' },
          { label: 'Errors', value: '0.04%' },
        ]},
        { type: 'progress', items: [
          { label: 'CPU Terrain  avg 54%', pct: 54 },
          { label: 'Memory Pressure  avg 70%', pct: 70 },
          { label: 'Network I/O  avg', pct: 38 },
        ]},
        { type: 'tags', label: 'Time Range', items: ['6h', '24h', '7d', '30d'] },
        { type: 'text', label: 'Trend Note', value: 'Memory trending up +3% over 6h. CPU stable. Network showing expected spiky bursts — no action needed.' },
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '14' },
          { label: 'Healthy', value: '12' },
          { label: 'Alerts', value: '2' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Healthy', 'Slow', 'Alert'] },
        { type: 'list', items: [
          { icon: 'check',    title: 'api-gateway',      sub: 'prod · 42ms p99',     badge: '✓' },
          { icon: 'check',    title: 'auth-service',     sub: 'prod · 18ms p99',     badge: '✓' },
          { icon: 'alert',    title: 'data-pipeline',    sub: 'prod · 890ms — slow', badge: '⚠' },
          { icon: 'check',    title: 'ml-inference',     sub: 'prod · 210ms p99',    badge: '✓' },
          { icon: 'zap',      title: 'postgres-primary', sub: 'prod · timeout',      badge: '!' },
          { icon: 'check',    title: 'redis-cache',      sub: 'prod · 1ms p99',      badge: '✓' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Incidents', value: '1' },
          { label: 'Warnings', value: '2' },
          { label: 'Resolved', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'INCIDENT · postgres-primary',   sub: 'connection pool exhausted · 23 min ago', badge: '🔴' },
          { icon: 'alert', title: 'WARNING · data-pipeline',       sub: 'p99 above 800ms threshold · 8 min ago',  badge: '🟡' },
          { icon: 'alert', title: 'WARNING · memory pressure',     sub: 'System at 76% — above baseline · 31m',   badge: '🟡' },
          { icon: 'check', title: 'RESOLVED · cdn-edge',           sub: 'cert rotation · 2h ago',                badge: '✓' },
          { icon: 'check', title: 'RESOLVED · worker-queue',       sub: 'backlog spike · 4h ago',                badge: '✓' },
        ]},
        { type: 'text', label: 'On-call', value: '@devops · Ahmed R. paged 23 min ago. Runbook: postgres/connection-pool.md' },
      ],
    },
    {
      id: 'deploy', label: 'Deploy',
      content: [
        { type: 'metric', label: 'Deploying Now', value: 'api-gateway v2.4.1', sub: 'feat/rate-limiting · 72% complete' },
        { type: 'progress', items: [
          { label: 'api-gateway · deploy in progress', pct: 72 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'auth-service v1.9.3',   sub: 'fix/jwt-expiry · 12 min ago · 4m 12s',  badge: '✓' },
          { icon: 'check', title: 'redis-cache v3.1.0',    sub: 'chore/upgrade · 1h ago · 2m 48s',        badge: '✓' },
          { icon: 'zap',   title: 'data-pipeline v0.8.7',  sub: 'feat/backfill · 3h ago · FAILED',        badge: '✗' },
          { icon: 'check', title: 'ml-inference v2.2.1',   sub: 'feat/embedding-v3 · 5h ago · 8m 03s',    badge: '✓' },
        ]},
        { type: 'tags', label: 'Environments', items: ['prod', 'staging', 'canary', 'dev'] },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'metrics',  label: 'Metrics',  icon: 'activity' },
    { id: 'services', label: 'Services', icon: 'layers' },
    { id: 'alerts',   label: 'Alerts',   icon: 'alert' },
    { id: 'deploy',   label: 'Deploy',   icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'topo-mock', 'TOPO — Interactive Mock');
console.log('Mock live at:', result.url);
