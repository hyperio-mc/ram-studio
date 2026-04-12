/**
 * vigil-mock.mjs
 * VIGIL — Always-On Software Reliability Intelligence
 * Svelte 5 Interactive Mock
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VIGIL',
  tagline:   'Always-On Software Reliability Intelligence',
  archetype: 'reliability-monitor',

  palette: {
    bg:      '#060810',
    surface: '#0F1120',
    text:    '#DCE4FF',
    accent:  '#7B6BFF',
    accent2: '#22E5A8',
    muted:   'rgba(220,228,255,0.35)',
  },

  lightPalette: {
    bg:      '#F0F2FF',
    surface: '#FFFFFF',
    text:    '#0A0B2E',
    accent:  '#6355E8',
    accent2: '#00A882',
    muted:   'rgba(10,11,46,0.4)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Platform Uptime (30d)', value: '99.98%', sub: 'SLA target: 99.95% — All clear' },
        { type: 'metric-row', items: [
          { label: 'SLA Compliance', value: '99.95%' },
          { label: 'MTTR', value: '4.2m' },
          { label: 'Error Budget', value: '83%' },
        ]},
        { type: 'progress', items: [
          { label: 'Error Budget Remaining', pct: 83 },
          { label: 'SLA Compliance Target', pct: 99 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'API Gateway latency spike', sub: '2h ago · P2 · Open', badge: 'P2' },
          { icon: 'check', title: 'Auth service degraded',     sub: '14h ago · P1 · Resolved', badge: '✓' },
          { icon: 'check', title: 'CDN cache miss elevated',   sub: '2d ago · P3 · Resolved',  badge: '✓' },
        ]},
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'text', label: 'Status', value: '6 services monitored · 1 active incident · 5 healthy' },
        { type: 'list', items: [
          { icon: 'check',   title: 'API Gateway',   sub: 'prod · 99.99% · 42ms avg',   badge: '●' },
          { icon: 'alert',   title: 'Auth Service',  sub: 'prod · 99.71% · 128ms avg',  badge: '!' },
          { icon: 'check',   title: 'Worker Queue',  sub: 'prod · 100% · 8ms avg',      badge: '●' },
          { icon: 'check',   title: 'Data Pipeline', sub: 'prod · 99.92% · 340ms avg',  badge: '●' },
          { icon: 'zap',     title: 'Search Index',  sub: 'prod · 98.10% · 210ms avg',  badge: '⚡' },
          { icon: 'check',   title: 'Email Service', sub: 'stg · 99.85% · 55ms avg',    badge: '●' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'text', label: 'Summary', value: '1 open incident · 3 resolved this week' },
        { type: 'list', items: [
          { icon: 'alert',  title: 'API Gateway latency spike',    sub: '2h ago · P2 · 1h 12m · 4 services',   badge: 'Open' },
          { icon: 'check',  title: 'Auth service degraded',        sub: '14h ago · P1 · 22m · 1 service',      badge: 'Fixed' },
          { icon: 'check',  title: 'CDN cache miss elevated',      sub: '2d ago · P3 · 5m · 1 service',        badge: 'Fixed' },
          { icon: 'check',  title: 'Search index replication lag', sub: '3d ago · P2 · 38m · 1 service',       badge: 'Fixed' },
        ]},
      ],
    },
    {
      id: 'latency', label: 'Latency',
      content: [
        { type: 'metric', label: 'API Gateway · p50 Latency', value: '41ms', sub: 'Last 24 hours — within SLA' },
        { type: 'metric-row', items: [
          { label: 'p50', value: '41ms'  },
          { label: 'p95', value: '98ms'  },
          { label: 'p99', value: '124ms' },
        ]},
        { type: 'progress', items: [
          { label: 'p50 budget used (200ms SLA)', pct: 21 },
          { label: 'p95 budget used (200ms SLA)', pct: 49 },
          { label: 'p99 budget used (200ms SLA)', pct: 62 },
        ]},
        { type: 'tags', label: 'Time Range', items: ['1h', '6h', '24h', '7d', '30d'] },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'text', label: 'Active Rules', value: '4 of 5 alert rules currently enabled' },
        { type: 'list', items: [
          { icon: 'bell',  title: 'High error rate',        sub: 'Error rate > 1% for 5m → PagerDuty',  badge: 'ON' },
          { icon: 'bell',  title: 'Latency SLA breach',     sub: 'p99 > 200ms for 10m → Slack',         badge: 'ON' },
          { icon: 'bell',  title: 'Zero traffic detected',  sub: 'RPS < 1 for 3m → Slack',              badge: 'ON' },
          { icon: 'bell',  title: 'Cert expiry warning',    sub: 'TLS cert < 14d remaining → Email',    badge: 'OFF' },
          { icon: 'bell',  title: 'Deployment anomaly',     sub: 'Error spike after deploy → Slack',    badge: 'ON' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home'     },
    { id: 'services',  label: 'Services',  icon: 'layers'   },
    { id: 'incidents', label: 'Incidents', icon: 'zap'      },
    { id: 'latency',   label: 'Latency',   icon: 'activity' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell'     },
  ],
};

console.log('Generating Svelte component…');
const svelteSource = generateSvelteComponent(design);

console.log('Building mock…');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'vigil-mock',
});

console.log('Publishing mock…');
const result = await publishMock(html, 'vigil-mock', 'VIGIL — Interactive Mock');
console.log('Mock live at:', result.url);
