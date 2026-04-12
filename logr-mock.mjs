// logr-mock.mjs — Svelte interactive mock for LOGR
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LOGR',
  tagline:   'Every event. Every insight. Zero noise.',
  archetype: 'developer-observability',
  palette: {
    bg:      '#08090E',
    surface: '#131726',
    text:    '#E2E8F0',
    accent:  '#4F6EF7',
    accent2: '#34D399',
    muted:   'rgba(226,232,240,0.35)',
  },
  lightPalette: {
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    text:    '#0E1018',
    accent:  '#3B55E0',
    accent2: '#0F9B6A',
    muted:   'rgba(14,16,24,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Events / 24H', value: '2.4M', sub: '↑ 18% vs yesterday' },
          { label: 'P99 Latency',  value: '42ms',  sub: '↓ 6ms improved' },
        ]},
        { type: 'metric', label: 'Error Rate', value: '0.12%', sub: '↑ spike at 14:32 — data-pipeline' },
        { type: 'progress', items: [
          { label: 'api-gateway',   pct: 100 },
          { label: 'auth-service',  pct: 100 },
          { label: 'queue-worker',  pct: 97 },
          { label: 'data-pipeline', pct: 94 },
        ]},
        { type: 'text', label: 'Active Alert', value: '⚡ data-pipeline P99 exceeded 500ms threshold' },
      ],
    },
    {
      id: 'stream', label: 'Stream',
      content: [
        { type: 'metric-row', items: [
          { label: 'Events/sec', value: '847', sub: 'Real-time' },
          { label: 'Errors/min', value: '23',  sub: 'Last 60s' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',  title: 'db.connection.timeout',    sub: '14:37:22 · data-pipeline', badge: 'ERROR' },
          { icon: 'alert',  title: 'rate_limit.exceeded',      sub: '14:37:21 · api-gateway',   badge: 'WARN' },
          { icon: 'check',  title: 'auth.session.created',     sub: '14:37:21 · auth-service',  badge: 'INFO' },
          { icon: 'zap',    title: 'queue.batch.processed',    sub: '14:37:21 · queue-worker',  badge: 'INFO' },
          { icon: 'alert',  title: 'webhook.parse.failed',     sub: '14:37:21 · data-pipeline', badge: 'ERROR' },
          { icon: 'eye',    title: 'cache.hit 94.2%',          sub: '14:37:21 · api-gateway',   badge: 'DEBUG' },
        ]},
        { type: 'tags', label: 'Level Filter', items: ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] },
      ],
    },
    {
      id: 'query', label: 'Query',
      content: [
        { type: 'text', label: 'Last Query', value: 'SELECT event_name, count(*) FROM events WHERE level = \'ERROR\' AND ts >= now() - interval \'1h\' GROUP BY event_name ORDER BY count(*) DESC' },
        { type: 'metric-row', items: [
          { label: 'Rows',    value: '12', sub: 'Results' },
          { label: 'Time',    value: '38ms', sub: 'Query time' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'db.connection.timeout', sub: 'data-pipeline', badge: '1,284' },
          { icon: 'alert', title: 'auth.token.invalid',    sub: 'auth-service',  badge: '892' },
          { icon: 'alert', title: 'webhook.parse.failed',  sub: 'data-pipeline', badge: '621' },
          { icon: 'alert', title: 'rate_limit.exceeded',   sub: 'api-gateway',   badge: '448' },
          { icon: 'eye',   title: 'cache.miss',            sub: 'api-gateway',   badge: '312' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',   value: '3',  sub: 'Alerts' },
          { label: 'Critical', value: '1',  sub: 'Severity' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'P99 Latency Exceeded',   sub: '847ms › 500ms · 14 min ago', badge: 'CRIT' },
          { icon: 'zap',   title: 'Error Rate Spike',        sub: '3.2% › 0.1% · 2hr ago',     badge: 'WARN' },
          { icon: 'eye',   title: 'Unusual Traffic Pattern', sub: '4× normal · 3hr ago',        badge: 'INFO' },
        ]},
        { type: 'text', label: 'Action', value: '🔕 Silence all alerts for 1 hour' },
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric-row', items: [
          { label: 'Connected', value: '4',    sub: 'Sources' },
          { label: 'Total',     value: '4.3M', sub: 'Events/day' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Vercel',         sub: '1.2M events/day', badge: '✓' },
          { icon: 'zap',      title: 'Supabase',       sub: '840K events/day', badge: '✓' },
          { icon: 'layers',   title: 'Cloudflare',     sub: '3.1M events/day', badge: '✓' },
          { icon: 'code',     title: 'GitHub Actions', sub: 'Paused',          badge: '⏸' },
        ]},
        { type: 'tags', label: 'SDK', items: ['Node.js', 'Python', 'Go', 'Ruby', 'Java'] },
        { type: 'text', label: 'Quick Start', value: 'npm install @logr/sdk' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'stream',   label: 'Stream',   icon: 'activity' },
    { id: 'query',    label: 'Query',    icon: 'code' },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell' },
    { id: 'sources',  label: 'Sources',  icon: 'layers' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'logr-mock', 'LOGR — Interactive Mock');
console.log('Mock live at:', result.url);
