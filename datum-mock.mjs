// datum-mock.mjs — Svelte interactive mock for DATUM
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DATUM',
  tagline:   'Every byte, in context.',
  archetype: 'observability-platform',

  palette: {           // DARK theme
    bg:      '#060910',
    surface: '#0C1020',
    text:    '#DCE8FF',
    accent:  '#00CFFF',
    accent2: '#7C6FFF',
    muted:   'rgba(220,232,255,0.40)',
  },

  lightPalette: {      // LIGHT theme
    bg:      '#F5F7FB',
    surface: '#FFFFFF',
    text:    '#0E1825',
    accent:  '#007ACC',
    accent2: '#5B4FCC',
    muted:   'rgba(14,24,37,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Global Error Rate · 24H', value: '0.04%', sub: 'p99 latency 841ms · 6 services' },
        { type: 'metric-row', items: [
          { label: 'Requests', value: '4.2M'  },
          { label: 'Apdex',    value: '0.93'  },
          { label: 'MTTR',     value: '4.2m'  },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'api-gateway',     sub: '99.99% · 18ms',   badge: 'OK'  },
          { icon: 'check',  title: 'auth-service',    sub: '100.0% · 9ms',    badge: 'OK'  },
          { icon: 'alert',  title: 'payments-worker', sub: '99.85% · 241ms',  badge: 'DEG' },
          { icon: 'zap',    title: 'search-indexer',  sub: '98.12% · 894ms',  badge: 'INC' },
          { icon: 'check',  title: 'webhook-fanout',  sub: '99.91% · 44ms',   badge: 'OK'  },
          { icon: 'check',  title: 'notification-svc',sub: '99.99% · 11ms',   badge: 'OK'  },
        ]},
        { type: 'tags', label: 'Active Incident', items: ['INC · search-indexer p99 > 800ms', '8m ago'] },
      ],
    },
    {
      id: 'traces', label: 'Traces',
      content: [
        { type: 'metric', label: 'Trace 0xb8c2 · POST /api/search', value: '894ms', sub: 'search-indexer · SLOW · 7 spans' },
        { type: 'progress', items: [
          { label: 'api-gateway · 0ms',    pct: 100 },
          { label: 'auth.verify · 2ms',    pct: 2   },
          { label: 'search.query · 12ms',  pct: 97  },
          { label: 'es.search · 14ms',     pct: 96  },
          { label: 'es.shard[0] · 420ms',  pct: 47  },
          { label: 'es.shard[1] · 856ms ⚠', pct: 96 },
        ]},
        { type: 'text', label: 'Slow Span: es.shard[1]', value: 'Status TIMEOUT (800ms) · index: products-v3 · 5 primary shards' },
        { type: 'metric-row', items: [
          { label: 'Similar', value: '4'    },
          { label: 'p99',     value: '902ms'},
          { label: 'TTFB',    value: '14ms' },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'tags', label: 'Filter Active', items: ['service:search', 'level:error'] },
        { type: 'list', items: [
          { icon: 'alert', title: '09:41:03 ERROR search',   sub: 'elasticsearch timeout after 800ms',     badge: 'ERR' },
          { icon: 'alert', title: '09:41:03 ERROR search',   sub: 'shard[1] unresponsive, retry 3/3',      badge: 'ERR' },
          { icon: 'zap',   title: '09:41:03 WARN  search',   sub: 'p99 latency threshold exceeded 756ms',  badge: 'WRN' },
          { icon: 'alert', title: '09:41:02 ERROR search',   sub: 'query planner fallback to full scan',   badge: 'ERR' },
          { icon: 'check', title: '09:41:02 INFO  gateway',  sub: 'circuit breaker OPEN for search',       badge: 'INF' },
          { icon: 'zap',   title: '09:41:01 WARN  search',   sub: 'slow shard detected: shard[1] 640ms',  badge: 'WRN' },
          { icon: 'check', title: '09:41:01 INFO  gateway',  sub: 'POST /api/search routed to search-v3',  badge: 'INF' },
          { icon: 'alert', title: '09:40:59 ERROR search',   sub: 'connection pool exhausted (limit: 50)', badge: 'ERR' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Errors',  value: '5'    },
          { label: 'Warns',   value: '3'    },
          { label: 'Lines',   value: '2.4K' },
        ]},
      ],
    },
    {
      id: 'metrics', label: 'Metrics',
      content: [
        { type: 'metric', label: 'Requests / Min', value: '4,218', sub: '+3.2% vs last hour · 24H window' },
        { type: 'metric-row', items: [
          { label: 'Error Rate', value: '0.04%' },
          { label: 'P99 Lat',   value: '841ms'  },
          { label: 'P50 Lat',   value: '18ms'   },
        ]},
        { type: 'progress', items: [
          { label: 'p50   18ms',   pct: 2  },
          { label: 'p75   44ms',   pct: 5  },
          { label: 'p90  134ms',   pct: 16 },
          { label: 'p95  312ms',   pct: 37 },
          { label: 'p99  841ms',   pct: 100 },
          { label: 'p999 2100ms',  pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'api-gateway',   sub: '4,218 req/min',  badge: '100%' },
          { icon: 'activity', title: 'auth-service',  sub: '4,210 req/min',  badge: '99%'  },
          { icon: 'alert',    title: 'search',        sub: '1,840 req/min',  badge: '44%'  },
          { icon: 'check',    title: 'payments',      sub: '382 req/min',    badge: '9%'   },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '3', sub: '2 critical · 1 warning · firing now' },
        { type: 'list', items: [
          { icon: 'zap',   title: 'search_p99_latency',  sub: 'p99 > 800ms · 8m · search-indexer',   badge: 'CRIT' },
          { icon: 'zap',   title: 'search_error_rate',   sub: 'rate > 1% · 6m · search-indexer',     badge: 'CRIT' },
          { icon: 'alert', title: 'payments_latency',    sub: 'p95 > 200ms · 22m · payments',        badge: 'WARN' },
          { icon: 'check', title: 'apdex_score_low',     sub: 'Not firing · apdex < 0.85',           badge: 'OK'   },
          { icon: 'check', title: 'api_5xx_burst',       sub: 'Disabled · 5xx > 5%',                 badge: 'OFF'  },
          { icon: 'check', title: 'db_conn_pool',        sub: 'Not firing · pool > 90%',             badge: 'OK'   },
        ]},
        { type: 'tags', label: 'Channels Active', items: ['PagerDuty', 'Slack', 'Webhook'] },
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'home'     },
    { id: 'traces',   label: 'Traces',   icon: 'activity' },
    { id: 'logs',     label: 'Logs',     icon: 'list'     },
    { id: 'metrics',  label: 'Metrics',  icon: 'chart'    },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'datum-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
