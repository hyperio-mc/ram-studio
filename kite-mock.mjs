// kite-mock.mjs — Svelte interactive mock for KITE API monitoring
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KITE',
  tagline:   'Real-time API health monitoring. Zero blind spots.',
  archetype: 'devtools',
  palette: {
    bg:      '#070709',
    surface: '#0E0E14',
    text:    '#EEEAE2',
    accent:  '#F97316',
    accent2: '#22C55E',
    muted:   'rgba(238,234,226,0.4)',
  },
  lightPalette: {
    bg:      '#F7F6F4',
    surface: '#FFFFFF',
    text:    '#0F0F11',
    accent:  '#EA6B0E',
    accent2: '#16A34A',
    muted:   'rgba(15,15,17,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'System Health', value: '98.7%', sub: 'All systems operational' },
        { type: 'metric-row', items: [
          { label: 'Endpoints', value: '47' },
          { label: 'Incidents', value: '1' },
          { label: 'P95 Latency', value: '142ms' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'POST /api/v2/payments', sub: 'High latency · 2,340ms P95', badge: 'ACTIVE' },
          { icon: 'check', title: 'GET /api/users/bulk', sub: 'Timeout spike · Resolved', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: '30-Day Uptime', pct: 99 },
        ]},
        { type: 'tags', label: 'Uptime', items: ['99.1%', 'Last 30d', '2 incidents'] },
      ],
    },
    {
      id: 'endpoints', label: 'Endpoints',
      content: [
        { type: 'tags', label: 'Filter', items: ['All  47', 'Healthy  44', 'Issues  3'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'GET /api/v2/users', sub: 'P95 72ms · 1.2k req/s', badge: '48ms' },
          { icon: 'alert', title: 'POST /api/v2/payments', sub: 'P95 2340ms · 340 req/s', badge: '2340ms' },
          { icon: 'activity', title: 'GET /api/v2/products', sub: 'P95 98ms · 3.4k req/s', badge: '61ms' },
          { icon: 'activity', title: 'PUT /api/v2/orders/:id', sub: 'P95 480ms · 201 req/s', badge: '310ms' },
          { icon: 'activity', title: 'GET /api/v2/analytics', sub: 'P95 240ms · 520 req/s', badge: '190ms' },
        ]},
      ],
    },
    {
      id: 'incident', label: 'Incident',
      content: [
        { type: 'metric', label: 'Active Incident #1042', value: 'CRITICAL', sub: 'POST /api/v2/payments · 14m active' },
        { type: 'metric-row', items: [
          { label: 'P50', value: '1840ms' },
          { label: 'P95', value: '2340ms' },
          { label: 'Error %', value: '0.4%' },
        ]},
        { type: 'progress', items: [
          { label: 'P95 Latency (max 3000ms)', pct: 78 },
          { label: 'Error Rate (max 5%)', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '09:27 — Incident opened', sub: 'Latency threshold exceeded (>2000ms)', badge: '!' },
          { icon: 'bell', title: '09:29 — Alert sent', sub: 'PagerDuty + Slack #backend-alerts', badge: '✓' },
          { icon: 'user', title: '09:33 — Assigned to @jkumar', sub: 'Auto-assigned via on-call schedule', badge: '✓' },
          { icon: 'search', title: '09:38 — Investigating', sub: 'DB connection pool at 96% capacity', badge: '…' },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', '2xx', '4xx', '5xx'] },
        { type: 'list', items: [
          { icon: 'check', title: '200  GET /api/v2/users', sub: '09:41:18 · 48ms · 103.24.x.x', badge: '200' },
          { icon: 'alert', title: '200  POST /api/v2/payments', sub: '09:41:17 · 2340ms · SLOW', badge: '⚠' },
          { icon: 'check', title: '200  GET /api/v2/products', sub: '09:41:17 · 61ms · 172.16.x.x', badge: '200' },
          { icon: 'alert', title: '401  GET /api/v2/users/me', sub: '09:41:15 · 12ms · unauthorized', badge: '401' },
          { icon: 'check', title: '204  DELETE /api/v1/sessions', sub: '09:41:15 · 29ms · 103.24.x.x', badge: '204' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'tags', label: 'Channels', items: ['Slack ✓', 'PagerDuty ✓', '+ Webhook'] },
        { type: 'list', items: [
          { icon: 'bell', title: 'Latency Critical', sub: 'P95 > 2000ms · All endpoints', badge: 'ON' },
          { icon: 'bell', title: 'Latency Warning', sub: 'P95 > 500ms · All endpoints', badge: 'ON' },
          { icon: 'bell', title: 'Error Rate Spike', sub: '5xx > 1% · All endpoints', badge: 'ON' },
          { icon: 'bell', title: 'Uptime Drop', sub: 'Uptime < 99% · Production', badge: 'ON' },
          { icon: 'bell', title: 'High Traffic', sub: 'RPS > 10,000 · /api/v2/users', badge: 'OFF' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home' },
    { id: 'endpoints', label: 'Endpoints', icon: 'activity' },
    { id: 'incident',  label: 'Incident',  icon: 'alert' },
    { id: 'logs',      label: 'Logs',      icon: 'code' },
    { id: 'alerts',    label: 'Alerts',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kite-mock', 'KITE — Interactive Mock');
console.log('Mock live at:', result.url);
