import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TRACE',
  tagline:   'API Observability Engine',
  archetype: 'api-observability',
  palette: {
    bg:      '#080B14',
    surface: '#0F1420',
    text:    '#E8EDF5',
    accent:  '#00FF88',
    accent2: '#5B8DEF',
    muted:   'rgba(74,85,104,0.9)',
  },
  lightPalette: {
    bg:      '#F4F6FA',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#00A855',
    accent2: '#2563EB',
    muted:   'rgba(80,90,110,0.7)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Uptime · 90 Days', value: '99.97%', sub: 'All systems healthy' },
        { type: 'metric-row', items: [
          { label: 'Latency p95', value: '142ms' },
          { label: 'Req / sec', value: '8.4k' },
          { label: 'Error Rate', value: '0.03%' },
        ]},
        { type: 'progress', items: [
          { label: '/api/v2/auth', pct: 100 },
          { label: '/api/v2/data', pct: 99.8 },
          { label: '/api/v2/events', pct: 100 },
          { label: '/api/v1/legacy', pct: 97.2 },
        ]},
        { type: 'text', label: 'System Status', value: 'All 14 endpoints operating within normal parameters. One degraded legacy endpoint under investigation.' },
      ],
    },
    {
      id: 'endpoints', label: 'Endpoints',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '14' },
          { label: 'Errors', value: '0' },
          { label: 'Degraded', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'GET /api/v2/auth', sub: 'p50: 42ms · p99: 89ms', badge: '2.8k rps' },
          { icon: 'check', title: 'POST /api/v2/data', sub: 'p50: 98ms · p99: 201ms', badge: '1.9k rps' },
          { icon: 'check', title: 'GET /api/v2/events', sub: 'p50: 61ms · p99: 138ms', badge: '1.2k rps' },
          { icon: 'alert', title: 'POST /api/v1/legacy', sub: 'p50: 220ms · p99: 890ms', badge: '340 rps' },
          { icon: 'check', title: 'GET /api/v2/webhooks', sub: 'p50: 55ms · p99: 120ms', badge: '88 rps' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric-row', items: [
          { label: 'MTTR', value: '6.8min' },
          { label: 'Active', value: '1' },
          { label: 'Resolved', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'INC-0041 — Elevated p99 latency', sub: '/api/v1/legacy · 2h ago · ONGOING', badge: 'WARN' },
          { icon: 'check', title: 'INC-0040 — Auth service 503 burst', sub: '/api/v2/auth · 6h ago · RESOLVED', badge: '4m' },
          { icon: 'check', title: 'INC-0039 — DB pool exhausted', sub: '/api/v2/data · 1d ago · RESOLVED', badge: '11m' },
          { icon: 'check', title: 'INC-0038 — Webhook rate drop', sub: '/api/v2/webhooks · 3d ago · RESOLVED', badge: '8m' },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'tags', label: 'Filter', items: ['ALL', 'INFO', 'WARN', 'ERROR'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'GET /api/v2/auth 200 42ms', sub: '14:22:01.441', badge: 'INFO' },
          { icon: 'activity', title: 'POST /api/v2/data 201 98ms', sub: '14:22:01.388', badge: 'INFO' },
          { icon: 'alert', title: 'POST /api/v1/legacy 200 445ms', sub: '14:22:00.901', badge: 'WARN' },
          { icon: 'zap', title: 'GET /api/v2/config 503 timeout', sub: '14:21:59.221', badge: 'ERR' },
          { icon: 'activity', title: 'DELETE /api/v2/resources 204 74ms', sub: '14:21:59.101', badge: 'INFO' },
          { icon: 'alert', title: 'POST /api/v1/legacy 200 612ms', sub: '14:21:58.442', badge: 'WARN' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '3' },
          { label: 'Paused', value: '1' },
          { label: 'Channels', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Latency p99 > 500ms', sub: 'all endpoints · cooldown: 5m', badge: 'ON' },
          { icon: 'check', title: 'Error rate > 1%', sub: 'all endpoints · cooldown: 10m', badge: 'ON' },
          { icon: 'check', title: 'Uptime < 99.9%', sub: 'account-wide · cooldown: 30m', badge: 'ON' },
          { icon: 'eye', title: 'No requests > 10m', sub: '/api/v2/auth · cooldown: 15m', badge: 'OFF' },
        ]},
        { type: 'tags', label: 'Notify via', items: ['PagerDuty', 'Slack #ops', 'Email'] },
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'activity' },
    { id: 'endpoints', label: 'Endpoints', icon: 'layers' },
    { id: 'incidents', label: 'Incidents', icon: 'zap' },
    { id: 'logs',      label: 'Logs',      icon: 'list' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'trace-mock', 'TRACE — Interactive Mock');
console.log('Mock live at:', result.url);
