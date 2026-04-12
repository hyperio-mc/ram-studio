import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Uplink',
  tagline:   "Your API's nervous system.",
  archetype: 'monitoring-dashboard',
  palette: {
    bg:      '#0B0D14',
    surface: '#13161F',
    text:    '#EDF0F8',
    accent:  '#4F7EFF',
    accent2: '#FF4F6A',
    muted:   'rgba(237,240,248,0.35)',
  },
  lightPalette: {
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    text:    '#0D1020',
    accent:  '#3B6EEF',
    accent2: '#E83353',
    muted:   'rgba(13,16,32,0.40)',
  },
  screens: [
    {
      id: 'status', label: 'Status',
      content: [
        { type: 'metric', label: '30-Day Uptime', value: '99.98%', sub: '↑ +0.01% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Req/min', value: '4.2K' },
          { label: 'P99 ms',  value: '182' },
          { label: 'Errors',  value: '0.02%' },
          { label: 'Regions', value: '6' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'API Gateway',       sub: 'api.uplink.dev',    badge: '48ms' },
          { icon: 'check', title: 'Auth Service',      sub: 'auth.uplink.dev',   badge: '23ms' },
          { icon: 'alert', title: 'Webhook Processor', sub: 'hooks.uplink.dev',  badge: '340ms' },
          { icon: 'check', title: 'Data Pipeline',     sub: 'stream.uplink.dev', badge: '61ms' },
          { icon: 'check', title: 'CDN / Assets',      sub: 'cdn.uplink.dev',    badge: '12ms' },
        ]},
      ],
    },
    {
      id: 'routes', label: 'Routes',
      content: [
        { type: 'metric-row', items: [
          { label: 'Monitored', value: '14' },
          { label: 'Healthy',   value: '13' },
          { label: 'Slow',      value: '1' },
          { label: 'Down',      value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'eye',  title: 'GET /api/v2/users',    sub: 'P50: 28ms · P99: 94ms',  badge: '1.2K' },
          { icon: 'plus', title: 'POST /api/v2/events',  sub: 'P50: 41ms · P99: 112ms', badge: '890' },
          { icon: 'eye',  title: 'GET /api/v2/metrics',  sub: 'P50: 18ms · P99: 58ms',  badge: '642' },
          { icon: 'alert',title: 'POST /api/v2/webhooks',sub: 'P50: 340ms · P99: 980ms — ⚠ Slow', badge: '88' },
          { icon: 'eye',  title: 'GET /health',          sub: 'P50: 4ms · P99: 11ms',   badge: '3.1K' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric-row', items: [
          { label: 'MTTD',  value: '3m 12s' },
          { label: 'MTTR',  value: '14m 8s' },
          { label: 'SLA',   value: '99.98%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Webhook latency spike',     sub: 'Mar 28 · 18 min · Degraded', badge: 'INC-042' },
          { icon: 'alert', title: 'Auth partial outage',       sub: 'Mar 24 · 7 min · Outage',    badge: 'INC-041' },
          { icon: 'alert', title: 'CDN cache invalidation',    sub: 'Mar 19 · 31 min · Degraded', badge: 'INC-040' },
          { icon: 'alert', title: 'API Gateway cold start',    sub: 'Mar 14 · 5 min · Degraded',  badge: 'INC-039' },
          { icon: 'alert', title: 'DB connection pool exhausted', sub: 'Mar 10 · 2 min · Outage', badge: 'INC-038' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg P50', value: '29ms' },
          { label: 'Avg P99', value: '104ms' },
          { label: 'Error %', value: '0.02%' },
          { label: 'Req/day', value: '6.2M' },
        ]},
        { type: 'progress', items: [
          { label: 'US East — 28ms',  pct: 42 },
          { label: 'EU West — 41ms',  pct: 28 },
          { label: 'Asia Pac — 68ms', pct: 18 },
          { label: 'US West — 19ms',  pct: 12 },
        ]},
        { type: 'text', label: 'This Week', value: 'P99 latency improved 8% from last week. Error rate stable at 0.02%. EU West seeing slight increase — worth monitoring.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'On-Call', value: 'Jordan K.', sub: 'Until Mon 09:00 UTC · ● Live' },
        { type: 'list', items: [
          { icon: 'bell',  title: 'High Error Rate',     sub: 'error_rate > 1% for 5m → PagerDuty',    badge: '●' },
          { icon: 'bell',  title: 'P99 Latency Spike',   sub: 'p99 > 500ms for 2m → Slack',             badge: '●' },
          { icon: 'bell',  title: 'Service Down',        sub: 'uptime fails 3x → PagerDuty + SMS',       badge: '●' },
          { icon: 'eye',   title: 'Low Traffic Anomaly', sub: 'req/min drops > 80% → Slack (disabled)',  badge: '○' },
        ]},
        { type: 'tags', label: 'Channels', items: ['Slack', 'PagerDuty', 'Email', 'SMS'] },
      ],
    },
  ],
  nav: [
    { id: 'status',    label: 'Status',    icon: 'activity' },
    { id: 'routes',    label: 'Routes',    icon: 'list' },
    { id: 'incidents', label: 'Incidents', icon: 'zap' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'uplink-mock', 'Uplink — Interactive Mock');
console.log('Mock live at:', result.url);
