import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ZINC',
  tagline:   'API health at a glance',
  archetype: 'api-monitoring',
  palette: {
    bg:      '#0A0A09',
    surface: '#111110',
    text:    '#E8E4DC',
    accent:  '#F5A623',
    accent2: '#52C97A',
    muted:   'rgba(122,120,112,0.5)',
  },
  lightPalette: {
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1A1916',
    accent:  '#C47D00',
    accent2: '#2E8B57',
    muted:   'rgba(26,25,22,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Uptime',     value: '99.98%' },
          { label: 'P95',        value: '142ms' },
          { label: 'Req/min',    value: '8,432' },
        ]},
        { type: 'metric', label: 'DEGRADED ENDPOINT', value: '/v2/search', sub: '42 min — 892ms avg latency' },
        { type: 'list', items: [
          { icon: 'activity', title: '/v1/auth',     sub: '48ms · 2.1k/s',  badge: 'OK' },
          { icon: 'activity', title: '/v1/data',     sub: '89ms · 3.8k/s',  badge: 'OK' },
          { icon: 'alert',    title: '/v2/search',   sub: '892ms · 0.4k/s', badge: 'ERR' },
          { icon: 'activity', title: '/v1/webhooks', sub: '211ms · 0.9k/s', badge: '!' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Uptime',     value: '99.98%' },
          { label: 'MTTR',       value: '4.2 min' },
          { label: 'Incidents',  value: '3' },
        ]},
        { type: 'progress', items: [
          { label: '/v1/data (3.8k/s)',     pct: 85 },
          { label: '/v1/auth (2.1k/s)',     pct: 48 },
          { label: '/v1/webhooks (0.9k/s)', pct: 20 },
          { label: '/v2/search (0.4k/s)',   pct: 9 },
        ]},
        { type: 'text', label: 'Anomaly', value: 'Unusual traffic spike on /v2/search — +340% above baseline at Fri 15:38' },
        { type: 'tags', label: 'P95 Trend', items: ['88ms Mon', '102ms Wed', '892ms Fri', '380ms Sun'] },
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'metric', label: 'Active errors', value: '7', sub: 'Last 30 min · /v2/search' },
        { type: 'list', items: [
          { icon: 'alert', title: 'timeout /v2/search?q=ml',          sub: '15:41:03 · 5001ms', badge: 'ERR' },
          { icon: 'alert', title: 'upstream 504 /v2/search',          sub: '15:41:02 · 3002ms', badge: 'ERR' },
          { icon: 'alert', title: 'timeout /v2/search?q=deep',        sub: '15:40:58 · 5001ms', badge: 'ERR' },
          { icon: 'alert', title: 'DB query exceeded 2s SLA',         sub: '15:40:51 · 2341ms', badge: 'ERR' },
          { icon: 'zap',   title: 'index shard 2 unresponsive',       sub: '15:40:47', badge: 'ERR' },
          { icon: 'zap',   title: 'p95 > 500ms threshold',            sub: '15:40:39 · 672ms',  badge: '!' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',  value: '3' },
          { label: 'Rules',   value: '5' },
          { label: 'Firing',  value: '2 crit' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'P95 > 500ms',       sub: '/v2/search · 42 min',  badge: 'CRIT' },
          { icon: 'alert', title: 'Error rate > 20%',  sub: '/v2/search · 42 min',  badge: 'CRIT' },
          { icon: 'zap',   title: 'Req volume drop',   sub: '/v1/data · 8 min',     badge: 'WARN' },
        ]},
        { type: 'tags', label: 'Channels', items: ['Slack #incidents', 'PagerDuty P1', 'Email on-call'] },
        { type: 'text', label: 'Next check', value: 'Evaluation window: 60s · Cool-down: 5 min' },
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Connected APIs', value: '4', sub: 'Last sync 2 min ago' },
        { type: 'list', items: [
          { icon: 'check', title: 'Production API',  sub: 'api.example.com · 4 endpoints', badge: 'ON' },
          { icon: 'check', title: 'Staging API',     sub: 'api-stg.example.com',           badge: 'ON' },
          { icon: 'eye',   title: 'Partners API',    sub: 'ext.partner.io',                badge: 'ON' },
          { icon: 'lock',  title: 'Internal API',    sub: 'internal.example.com',          badge: 'ON' },
        ]},
        { type: 'tags', label: 'SLA Thresholds', items: ['P95 < 500ms', 'Uptime > 99.9%', 'Error < 5%'] },
        { type: 'text', label: 'Heartbeat', value: 'RAM Design Heartbeat #466 · godly.website · Alphamark one-color-max principle' },
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home' },
    { id: 'insights',  label: 'Insights',  icon: 'chart' },
    { id: 'logs',      label: 'Logs',      icon: 'activity' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
    { id: 'settings',  label: 'Settings',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'zinc-mock', 'ZINC — Interactive Mock');
console.log('Mock live at:', result.url || `https://ram.zenbin.org/zinc-mock`);
