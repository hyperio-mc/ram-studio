import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PULSAR',
  tagline:   'Real-time API pulse monitor',
  archetype: 'developer-tools',
  palette: {
    bg:      '#000000',
    surface: '#0A0A0C',
    text:    '#E2E8F0',
    accent:  '#A855F7',
    accent2: '#10F58C',
    muted:   'rgba(148,163,184,0.45)',
  },
  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0F1020',
    accent:  '#7C3AED',
    accent2: '#059669',
    muted:   'rgba(15,16,32,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'API Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'UPTIME',   value: '99.8%' },
          { label: 'P95',      value: '142ms' },
          { label: 'ERRORS',   value: '0.2%'  },
          { label: 'RPM',      value: '58.4K' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: '/api/v2/users',    sub: '45ms · GET 200',  badge: '✓' },
          { icon: 'alert',    title: '/api/v2/auth',     sub: '301ms · GET 504', badge: '✗' },
          { icon: 'activity', title: '/api/v2/payments', sub: '92ms · POST 201', badge: '✓' },
          { icon: 'alert',    title: '/api/v2/webhooks', sub: '440ms · GET 200', badge: '!' },
          { icon: 'activity', title: '/api/v2/metrics',  sub: '67ms · GET 200',  badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: '/api/v2/auth    error rate',  pct: 47 },
          { label: '/api/v2/webhooks latency',    pct: 88 },
          { label: '/api/v2/events  queue depth', pct: 68 },
        ]},
        { type: 'tags', label: 'Live Status', items: ['● 24 services', '3 alerts', '99.8% uptime', 'P95 142ms'] },
        { type: 'text', label: 'Live Feed', value: '→ GET /api/v2/payments 201 92ms just now\n→ POST /api/v2/events 200 189ms 2s ago' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      content: [
        { type: 'metric-row', items: [
          { label: 'CRITICAL', value: '1' },
          { label: 'WARNING',  value: '2' },
          { label: 'HEALTHY',  value: '21' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '/api/v2/auth',     sub: 'CRITICAL · 4.7% error rate · 12m',  badge: '🔴' },
          { icon: 'alert', title: '/api/v2/webhooks', sub: 'WARNING · P95 440ms spike · 34m',    badge: '🟡' },
          { icon: 'alert', title: '/api/v2/events',   sub: 'WARNING · 2.4× volume spike · 1h',   badge: '✓' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Critical', 'Warning', 'Resolved'] },
        { type: 'text', label: 'Incident Note', value: '/api/v2/auth has been returning 504 Gateway Timeout for 12 minutes. Upstream service appears unresponsive.' },
      ],
    },
    {
      id: 'logs',
      label: 'Log Stream',
      content: [
        { type: 'tags', label: 'Level', items: ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] },
        { type: 'list', items: [
          { icon: 'activity', title: '09:41:08 INFO',  sub: '/api/v2/payments POST 201 92ms',  badge: '200' },
          { icon: 'alert',    title: '09:41:06 WARN',  sub: '/api/v2/webhooks GET 200 440ms',  badge: '!' },
          { icon: 'alert',    title: '09:41:05 ERROR', sub: '/api/v2/auth GET 504 timeout',    badge: '504' },
          { icon: 'activity', title: '09:41:04 INFO',  sub: '/api/v2/metrics GET 200 67ms',    badge: '200' },
          { icon: 'alert',    title: '09:41:03 ERROR', sub: '/api/v2/auth GET 504 retry 2/3',  badge: '504' },
          { icon: 'activity', title: '09:41:02 INFO',  sub: '/api/v2/search GET 200 128ms',    badge: '200' },
        ]},
        { type: 'text', label: 'Filter', value: 'Showing live tail · ALL levels · /api/v2/*' },
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      content: [
        { type: 'metric-row', items: [
          { label: 'CONNECTED', value: '9' },
          { label: 'AVAILABLE', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',     title: 'PagerDuty', sub: 'Alerting · Active',  badge: '●' },
          { icon: 'message',  title: 'Slack',     sub: 'Notify · Active',    badge: '●' },
          { icon: 'chart',    title: 'DataDog',   sub: 'Metrics · Active',   badge: '●' },
          { icon: 'code',     title: 'GitHub',    sub: 'Deploys · Active',   badge: '●' },
          { icon: 'eye',      title: 'Grafana',   sub: 'Viz · Active',       badge: '●' },
          { icon: 'alert',    title: 'Sentry',    sub: 'Errors · Active',    badge: '●' },
          { icon: 'zap',      title: 'OpsGenie',  sub: 'Alerting · Connect', badge: '+' },
        ]},
        { type: 'tags', label: 'Category', items: ['All', 'Alerting', 'Metrics', 'Notify', 'Errors'] },
      ],
    },
    {
      id: 'endpoint',
      label: 'Endpoint Detail',
      content: [
        { type: 'metric-row', items: [
          { label: 'P50',      value: '289ms' },
          { label: 'ERR RATE', value: '4.7%'  },
          { label: 'UPTIME',   value: '94.2%' },
        ]},
        { type: 'progress', items: [
          { label: 'Error rate vs threshold',  pct: 94 },
          { label: 'Latency vs SLA (300ms)',   pct: 96 },
          { label: 'Availability',             pct: 94 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '504 Gateway Timeout', sub: 'upstream >500ms · 2m ago',  badge: '🔴' },
          { icon: 'alert', title: '503 Service Unavail', sub: 'pod restart · 8m ago',       badge: '🔴' },
          { icon: 'alert', title: '504 Gateway Timeout', sub: 'upstream >500ms · 14m ago', badge: '🔴' },
          { icon: 'alert', title: '401 Auth Expired',    sub: 'client error · 31m ago',     badge: '🟡' },
        ]},
        { type: 'text', label: 'Endpoint', value: 'GET /api/v2/auth\nStatus: DOWN · 12 minutes\nSince: 09:29:05 UTC' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric',     label: 'Team Plan', value: 'PRO', sub: 'Acme Corp · 3 members' },
        { type: 'list', items: [
          { icon: 'user',     title: 'Jordan Lee',  sub: 'Admin',  badge: '👑' },
          { icon: 'user',     title: 'Sam Rivera',  sub: 'Editor', badge: '✎' },
          { icon: 'user',     title: 'Alex Chen',   sub: 'Viewer', badge: '👁' },
        ]},
        { type: 'progress', items: [
          { label: 'Error rate threshold  2%',   pct: 10 },
          { label: 'Latency threshold  300ms',   pct: 47 },
          { label: 'API quota used  580K/1M RPM', pct: 58 },
        ]},
        { type: 'tags', label: 'Notifications', items: ['Email', 'Slack', 'PagerDuty', 'SMS'] },
        { type: 'text', label: 'Workspace', value: 'Acme Corp · pulsar.app/acme\nPro plan · renews May 1, 2026' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Monitor',  icon: 'activity' },
    { id: 'alerts',       label: 'Alerts',   icon: 'bell'     },
    { id: 'logs',         label: 'Logs',     icon: 'list'     },
    { id: 'integrations', label: 'Connect',  icon: 'zap'      },
    { id: 'settings',     label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'pulsar-mock', 'PULSAR — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/pulsar-mock');
