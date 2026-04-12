import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WREN',
  tagline:   'Minimal API health monitoring. Big numbers, zero noise.',
  archetype: 'productivity',
  palette: {
    bg:      '#080808',
    surface: '#111111',
    text:    '#E4DFD3',
    accent:  '#BFFF00',
    accent2: '#FF3A4E',
    muted:   'rgba(228, 223, 211, 0.35)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'UPTIME · LAST 90 DAYS', value: '99.97%', sub: '● All Systems Operational' },
        { type: 'metric-row', items: [
          { label: 'INCIDENTS',    value: '2'    },
          { label: 'AVG LATENCY', value: '84ms' },
          { label: 'ENDPOINTS',   value: '47'   },
        ]},
        { type: 'progress', items: [
          { label: 'api.wren.dev — 62ms',       pct: 100 },
          { label: 'auth.wren.dev — 44ms',      pct: 100 },
          { label: 'cdn.wren.dev — 18ms',       pct: 100 },
          { label: 'webhooks.wren.dev — 210ms', pct: 72  },
          { label: 'jobs.wren.dev — DOWN',      pct: 0   },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'api.wren.dev',      sub: '62ms · UP',       badge: '✓ UP' },
          { icon: 'check',  title: 'auth.wren.dev',     sub: '44ms · UP',       badge: '✓ UP' },
          { icon: 'check',  title: 'cdn.wren.dev',      sub: '18ms · UP',       badge: '✓ UP' },
          { icon: 'alert',  title: 'webhooks.wren.dev', sub: '210ms · DEGRADED', badge: '⚠ SLOW' },
          { icon: 'alert',  title: 'jobs.wren.dev',     sub: '— · DOWN',        badge: '✗ DOWN' },
        ]},
      ],
    },
    {
      id: 'endpoints', label: 'Endpoints',
      content: [
        { type: 'metric-row', items: [
          { label: 'TOTAL',    value: '47' },
          { label: 'UP',       value: '43' },
          { label: 'DEGRADED', value: '2'  },
          // no 4th — 3 is fine
        ]},
        { type: 'tags', label: 'Filter', items: ['ALL · 47', 'UP · 43', 'DEGRADED · 2', 'DOWN · 2'] },
        { type: 'list', items: [
          { icon: 'code',   title: 'GET /v2/users',            sub: '62ms',  badge: '✓ UP'     },
          { icon: 'code',   title: 'GET /v2/users/:id',        sub: '78ms',  badge: '✓ UP'     },
          { icon: 'code',   title: 'POST /v2/users/auth',      sub: '94ms',  badge: '✓ UP'     },
          { icon: 'alert',  title: 'POST /v2/webhooks/dispatch', sub: '210ms', badge: '⚠ SLOW' },
          { icon: 'alert',  title: 'GET /v2/analytics/events', sub: '—',     badge: '✗ DOWN'   },
          { icon: 'code',   title: 'DELETE /v2/users/:id',     sub: '88ms',  badge: '✓ UP'     },
          { icon: 'code',   title: 'PUT /v2/settings',         sub: '55ms',  badge: '✓ UP'     },
          { icon: 'alert',  title: 'GET /v2/jobs/queue',       sub: '—',     badge: '✗ DOWN'   },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric-row', items: [
          { label: 'OPEN',       value: '1'   },
          { label: 'THIS WEEK',  value: '2'   },
          { label: 'THIS MONTH', value: '4'   },
          { label: 'MTTR',       value: '23m' },
        ]},
        { type: 'text', label: '🔴 ACTIVE INCIDENT', value: 'jobs.wren.dev — Service Down. Job queue worker unreachable across all 3 availability zones. Started 15m ago. Auto-failover triggered.' },
        { type: 'list', items: [
          { icon: 'check', title: 'webhooks — High Latency',   sub: '2 days ago · Resolved in 34m', badge: '✓ RESOLVED' },
          { icon: 'check', title: 'auth — Elevated Error Rate', sub: '6 days ago · Resolved in 12m', badge: '✓ RESOLVED' },
          { icon: 'check', title: 'cdn — Partial Outage',      sub: '14 days ago · Resolved in 8m',  badge: '✓ RESOLVED' },
        ]},
        { type: 'metric-row', items: [
          { label: 'SUCCESS RATE', value: '99.92%' },
          { label: 'AVG MTTR',    value: '18m'    },
          { label: 'TOTAL 90D',   value: '6'      },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: 'P50 LATENCY · 7 DAY AVG', value: '84ms', sub: 'p95: 218ms  ·  p99: 490ms  ·  ↓12% vs last week' },
        { type: 'metric-row', items: [
          { label: 'ERROR RATE',   value: '0.08%' },
          { label: 'APDEX',       value: '0.96'  },
          { label: 'REQ/SEC',     value: '32.4'  },
        ]},
        { type: 'progress', items: [
          { label: 'MON — 1.73M req', pct: 72 },
          { label: 'TUE — 2.11M req', pct: 88 },
          { label: 'WED — 2.18M req', pct: 91 },
          { label: 'THU — 2.04M req', pct: 85 },
          { label: 'FRI — 2.30M req', pct: 96 },
          { label: 'SAT — 1.06M req', pct: 44 },
          { label: 'SUN — 0.91M req', pct: 38 },
        ]},
        { type: 'tags', label: 'Status Codes', items: ['2xx — 91%', '3xx — 5%', '4xx — 3%', '5xx — 1%'] },
        { type: 'text', label: 'APDEX', value: 'Score: 0.96 — Excellent. Threshold Satisifed: <200ms (82%), Tolerated: <800ms (16%), Frustrated: >800ms (2%).' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'ACTIVE RULES', value: '4' },
          { label: 'CHANNELS',    value: '3' },
          { label: 'TRIGGERED 7D', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'Endpoint Down',       sub: 'Any endpoint: 0/3 checks succeed',          badge: '🔴 CRITICAL' },
          { icon: 'bell', title: 'Latency Spike',       sub: 'p95 > 500ms for 3 consecutive checks',      badge: '🟡 HIGH'     },
          { icon: 'bell', title: 'Error Rate Elevated', sub: '5xx rate > 1% over 5m window',              badge: '🟡 HIGH'     },
          { icon: 'bell', title: 'SSL Cert Expiry',     sub: 'Certificate expires in < 14 days',          badge: '🔵 MEDIUM'   },
          { icon: 'bell', title: 'Weekly Report',       sub: 'Every Monday 09:00 — summary digest',       badge: 'ℹ INFO'      },
        ]},
        { type: 'tags', label: 'Channels', items: ['PagerDuty ✓', 'Slack ✓', 'Email ✓', 'Webhook —'] },
        { type: 'text', label: 'ON-CALL', value: 'Active rotation: @sarah (primary), @james (secondary). Escalation policy: 5m → 15m → manager. PagerDuty integration active.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',   label: 'Overview',  icon: 'eye'      },
    { id: 'endpoints',  label: 'Endpoints', icon: 'list'     },
    { id: 'incidents',  label: 'Incidents', icon: 'alert'    },
    { id: 'analytics',  label: 'Analytics', icon: 'activity' },
    { id: 'alerts',     label: 'Alerts',    icon: 'bell'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 WREN mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'wren-mock', 'WREN — Interactive Mock');
console.log('Mock live at:', result.url);
