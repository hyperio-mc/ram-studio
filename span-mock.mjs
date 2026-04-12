import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPAN',
  tagline:   'Distributed Trace & API Intelligence',
  archetype: 'developer-tools-dark',

  palette: {
    bg:      '#040612',
    surface: '#0B1120',
    text:    '#E2E8F0',
    accent:  '#6366F1',
    accent2: '#22D3EE',
    muted:   'rgba(148,163,184,0.45)',
  },

  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#6366F1',
    accent2: '#0891B2',
    muted:   'rgba(71,85,105,0.45)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Health Score', value: '98.7', sub: 'All systems operational' },
        { type: 'metric-row', items: [
          { label: 'Req/Min',   value: '2,841' },
          { label: 'P99',       value: '142ms' },
          { label: 'Errors',    value: '0.04%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'GET /api/v2/users',           sub: '840 req/s · P99 48ms',  badge: '✓' },
          { icon: 'activity', title: 'POST /api/v2/events',          sub: '1.2k req/s · P99 89ms', badge: '✓' },
          { icon: 'alert',    title: 'GET /api/v2/analytics/daily',  sub: '312 req/s · P99 210ms', badge: '⚑' },
          { icon: 'activity', title: 'DELETE /api/v2/sessions/:id',  sub: '28 req/s · P99 34ms',   badge: '✓' },
        ]},
      ],
    },
    {
      id: 'requests', label: 'Requests',
      content: [
        { type: 'text', label: 'Stream', value: 'Streaming — 2,841 req/min' },
        { type: 'list', items: [
          { icon: 'check',  title: '200 GET /api/v2/users',           sub: '31ms · 54.2.11.9',    badge: '31ms' },
          { icon: 'check',  title: '201 POST /api/v2/events',          sub: '88ms · 203.0.2.44',  badge: '88ms' },
          { icon: 'check',  title: '200 GET /analytics/daily',          sub: '214ms · 10.0.0.12', badge: '214ms' },
          { icon: 'alert',  title: '422 POST /api/v2/webhooks',         sub: '44ms · 198.51.0.3', badge: '422' },
          { icon: 'alert',  title: '401 GET /api/v2/users/me',           sub: '11ms · 45.33.0.8', badge: '401' },
        ]},
      ],
    },
    {
      id: 'traces', label: 'Traces',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',  value: '88ms' },
          { label: 'Spans',  value: '6' },
          { label: 'Status', value: '201' },
          { label: 'Svcs',   value: '4' },
        ]},
        { type: 'progress', items: [
          { label: 'http.request (gateway)',   pct: 100 },
          { label: 'auth.verify (auth-svc)',    pct: 14  },
          { label: 'db.query.users (postgres)', pct: 9   },
          { label: 'events.validate',           pct: 20  },
          { label: 'queue.publish (rabbitmq)',   pct: 27  },
          { label: 'http.response (gateway)',    pct: 27  },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'text', label: 'FIRING', value: 'P99 latency on /analytics exceeded 200ms' },
        { type: 'list', items: [
          { icon: 'check', title: 'High Error Rate',    sub: 'error_rate > 1%',        badge: 'OK'  },
          { icon: 'alert', title: 'Slow P99 Latency',   sub: 'p99_ms > 200ms',         badge: '🔴' },
          { icon: 'check', title: 'Request Spike',      sub: 'rps increase > 300%',    badge: 'OK'  },
          { icon: 'check', title: 'Low Availability',   sub: 'uptime < 99.9%',         badge: 'OK'  },
          { icon: 'check', title: '5xx Error Burst',    sub: '5xx > 20 per 5min',      badge: 'OK'  },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'tags', label: 'Workspace', items: ['Acme Corp', 'prod-us-east-1', 'Pro Plan'] },
        { type: 'list', items: [
          { icon: 'key',  title: 'Production SDK',    sub: 'span_live_••••d4f9 · read/write', badge: '●' },
          { icon: 'key',  title: 'CI / Alerting',     sub: 'span_live_••••7a3c · read only',  badge: '●' },
          { icon: 'key',  title: 'Analytics Export',  sub: 'span_live_••••9b1d · read only',  badge: '●' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',   title: 'PagerDuty',       sub: 'Connected',       badge: '✓' },
          { icon: 'message',title: 'Slack',           sub: 'Connected',       badge: '✓' },
          { icon: 'activity',title:'Datadog',          sub: 'Not connected',   badge: '○' },
          { icon: 'code',   title: 'GitHub Actions',  sub: 'Connected',       badge: '✓' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home'     },
    { id: 'requests',  label: 'Requests', icon: 'activity' },
    { id: 'traces',    label: 'Traces',   icon: 'layers'   },
    { id: 'alerts',    label: 'Alerts',   icon: 'alert'    },
    { id: 'settings',  label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'span-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
