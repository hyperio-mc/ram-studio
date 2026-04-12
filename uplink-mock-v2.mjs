import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';

// Fallback publish that uses no subdomain
function publishFallback(html, slug, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}` });
        } else {
          resolve({ ok: false, status: res.statusCode, body: d.slice(0,200) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

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
          { icon: 'check', title: 'API Gateway',       sub: 'api.uplink.dev — 48ms',    badge: '✓' },
          { icon: 'check', title: 'Auth Service',      sub: 'auth.uplink.dev — 23ms',   badge: '✓' },
          { icon: 'alert', title: 'Webhook Processor', sub: 'hooks.uplink.dev — 340ms', badge: '⚠' },
          { icon: 'check', title: 'Data Pipeline',     sub: 'stream.uplink.dev — 61ms', badge: '✓' },
          { icon: 'check', title: 'CDN / Assets',      sub: 'cdn.uplink.dev — 12ms',    badge: '✓' },
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
          { icon: 'eye',   title: 'GET /api/v2/users',     sub: 'P50: 28ms · P99: 94ms · 1.2K rpm',  badge: '●' },
          { icon: 'plus',  title: 'POST /api/v2/events',   sub: 'P50: 41ms · P99: 112ms · 890 rpm',  badge: '●' },
          { icon: 'eye',   title: 'GET /api/v2/metrics',   sub: 'P50: 18ms · P99: 58ms · 642 rpm',   badge: '●' },
          { icon: 'alert', title: 'POST /api/v2/webhooks', sub: 'P50: 340ms · P99: 980ms ⚠ Slow',    badge: '⚠' },
          { icon: 'eye',   title: 'GET /health',           sub: 'P50: 4ms · P99: 11ms · 3.1K rpm',   badge: '●' },
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
          { icon: 'alert', title: 'Webhook latency spike',        sub: 'Mar 28 · 18 min · Degraded',    badge: '042' },
          { icon: 'alert', title: 'Auth partial outage',          sub: 'Mar 24 · 7 min · Outage',        badge: '041' },
          { icon: 'alert', title: 'CDN cache invalidation delay', sub: 'Mar 19 · 31 min · Degraded',     badge: '040' },
          { icon: 'alert', title: 'API Gateway cold start burst', sub: 'Mar 14 · 5 min · Degraded',      badge: '039' },
          { icon: 'alert', title: 'DB connection pool exhausted', sub: 'Mar 10 · 2 min · Outage',        badge: '038' },
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
        { type: 'text', label: 'Weekly Insight', value: 'P99 latency improved 8% from last week. Error rate stable at 0.02%. EU West seeing slight uptick.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'On-Call Now', value: 'Jordan K.', sub: 'Until Mon 09:00 UTC · ● Live' },
        { type: 'list', items: [
          { icon: 'bell', title: 'High Error Rate',      sub: 'error_rate > 1% for 5m → PagerDuty',   badge: 'ON' },
          { icon: 'bell', title: 'P99 Latency Spike',    sub: 'p99 > 500ms for 2m → Slack',            badge: 'ON' },
          { icon: 'bell', title: 'Service Down',         sub: 'uptime fails 3x → PagerDuty + SMS',     badge: 'ON' },
          { icon: 'eye',  title: 'Low Traffic Anomaly',  sub: 'req/min drops > 80% (disabled)',         badge: 'OFF' },
        ]},
        { type: 'tags', label: 'Channels Active', items: ['Slack', 'PagerDuty', 'Email', 'SMS'] },
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

console.log('Building Svelte mock...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Mock built, publishing...');
const result = await publishFallback(html, 'uplink-mock', 'Uplink — Interactive Mock');
console.log('Mock result:', result.ok ? `✓ ${result.url}` : `✗ ${result.status} ${result.body}`);
