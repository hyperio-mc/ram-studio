import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'HOOK',
  tagline: 'Webhook Inspector & Debugger',
  archetype: 'developer-tools',
  palette: {
    bg:      '#0E1015',
    surface: '#151921',
    text:    '#E8EAEF',
    accent:  '#5E6AD2',
    accent2: '#14B69C',
    muted:   'rgba(232,234,239,0.45)',
  },
  lightPalette: {
    bg:      '#F4F5F7',
    surface: '#FFFFFF',
    text:    '#1A1D23',
    accent:  '#4A55B8',
    accent2: '#0F9A84',
    muted:   'rgba(26,29,35,0.45)',
  },
  screens: [
    {
      id: 'live',
      label: 'Live',
      content: [
        { type: 'metric-row', items: [
          { label: 'Events / min', value: '142' },
          { label: 'Success rate', value: '99.3%' },
          { label: 'P95 latency',  value: '48ms'  },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'POST /webhooks/stripe',    sub: '200 OK · 23ms · now',    badge: '200' },
          { icon: 'check',    title: 'POST /webhooks/github',    sub: '200 OK · 31ms · 1s',     badge: '200' },
          { icon: 'alert',    title: 'POST /webhooks/sendgrid',  sub: '500 ERR · 1204ms · 2s',  badge: '500' },
          { icon: 'check',    title: 'POST /webhooks/shopify',   sub: '200 OK · 18ms · 4s',     badge: '200' },
          { icon: 'activity', title: 'POST /webhooks/pagerduty', sub: '429 Too Many · 88ms · 9s',badge: '429'},
          { icon: 'check',    title: 'POST /webhooks/linear',    sub: '200 OK · 29ms · 11s',    badge: '200' },
        ]},
        { type: 'tags', label: 'Endpoints', items: ['stripe-events','github-webhooks','sendgrid-bounce','shopify-orders'] },
      ],
    },
    {
      id: 'hooks',
      label: 'Hooks',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',  value: '6'    },
          { label: 'Active', value: '5'    },
          { label: 'Failing',value: '1'    },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'stripe-events',    sub: '1,240/hr · 99.8% success',  badge: '✓'  },
          { icon: 'check',    title: 'github-webhooks',  sub: '88/hr · 100% success',       badge: '✓'  },
          { icon: 'alert',    title: 'sendgrid-bounce',  sub: '34/hr · 67.2% success',      badge: 'ERR'},
          { icon: 'check',    title: 'shopify-orders',   sub: '206/hr · 99.1% success',     badge: '✓'  },
          { icon: 'activity', title: 'pagerduty-alerts', sub: '12/hr · 83.3% success',      badge: '!'  },
          { icon: 'check',    title: 'linear-events',    sub: '55/hr · 100% success',       badge: '✓'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Failing', 'Paused'] },
      ],
    },
    {
      id: 'inspector',
      label: 'Inspector',
      content: [
        { type: 'metric', label: 'POST /webhooks/sendgrid · sendgrid-bounce', value: '500 ERR', sub: '1,204ms · 2 seconds ago · incident #247' },
        { type: 'text', label: 'Payload', value: '{ "event": "email.bounced", "timestamp": 1744243200, "email": "user@example.com", "reason": "550 5.1.1 User unknown.", "bounce_type": "hard" }' },
        { type: 'text', label: 'Error Trace', value: 'Error: Database write failed\n  at processEvent (handlers.js:142)\n  at POST /webhooks/sendgrid\n  at router.handle (express.js:284)' },
        { type: 'progress', items: [
          { label: 'Request received (0ms)',    pct: 5  },
          { label: 'Auth verified (4ms)',       pct: 10 },
          { label: 'Handler invoked (12ms)',    pct: 20 },
          { label: 'DB write failed (1204ms)',  pct: 100},
        ]},
        { type: 'tags', label: 'Actions', items: ['↺ Replay', '→ Debug', 'Share Link', 'Open in Editor'] },
      ],
    },
    {
      id: 'logs',
      label: 'Logs',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total today', value: '14,240' },
          { label: 'Failed',      value: '28'      },
          { label: 'Retried',     value: '12'      },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'POST /webhooks/stripe',    sub: '09:41:02 · stripe-events · 23ms',    badge: '200'},
          { icon: 'check',    title: 'POST /webhooks/github',    sub: '09:41:01 · github-webhooks · 31ms',  badge: '200'},
          { icon: 'alert',    title: 'POST /webhooks/sendgrid',  sub: '09:41:00 · sendgrid-bounce · 1204ms',badge: '500'},
          { icon: 'check',    title: 'POST /webhooks/shopify',   sub: '09:40:58 · shopify-orders · 18ms',   badge: '200'},
          { icon: 'activity', title: 'POST /webhooks/pagerduty', sub: '09:40:55 · pagerduty-alerts · 88ms', badge: '429'},
          { icon: 'alert',    title: 'POST /webhooks/sendgrid',  sub: '09:40:45 · sendgrid-bounce · 987ms', badge: '500'},
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Failed', '2xx', '4xx', '5xx', 'Slow'] },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Incident · 8 minutes ago', value: '1 Incident', sub: 'sendgrid-bounce: error rate 32.8% · 3 people notified · incident #247' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'Error rate spike',     sub: '> 5% over 2 min → Slack, PagerDuty', badge: 'ON' },
          { icon: 'activity', title: 'Success rate drop',    sub: '< 95% over 5 min → Slack',           badge: 'ON' },
          { icon: 'activity', title: 'Latency P95 high',     sub: '> 500ms 3 min avg → PagerDuty',      badge: 'ON' },
          { icon: 'alert',    title: 'Zero events received', sub: '0 events > 10 min → Slack, Email',   badge: 'ON' },
          { icon: 'check',    title: 'Endpoint paused',      sub: 'On manual pause → Email',            badge: 'OFF'},
        ]},
        { type: 'tags', label: 'Channels', items: ['Slack', 'PagerDuty', 'Email', 'Webhook', 'SMS'] },
      ],
    },
    {
      id: 'endpoint',
      label: 'Endpoint',
      content: [
        { type: 'metric', label: 'stripe-events', value: '99.8% success', sub: '1,240/hr · P95 23ms · 99.9% uptime · HMAC-SHA256 verified' },
        { type: 'metric-row', items: [
          { label: 'Requests/hr', value: '1,240' },
          { label: 'P95 latency', value: '23ms'  },
          { label: 'Uptime',      value: '99.9%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '500 POST /webhooks/sendgrid', sub: '1,204ms · 2s ago',  badge: 'VIEW' },
          { icon: 'alert', title: '503 POST /webhooks/sendgrid', sub: '2,034ms · 3m ago',  badge: 'VIEW' },
        ]},
        { type: 'text', label: 'Config', value: 'URL: https://wh.acme.co/stripe · Timeout: 30s · Retry: 3× exponential backoff · Signing: HMAC-SHA256 · Secret: whsec_●●●●●●●●' },
        { type: 'tags', label: 'Actions', items: ['⏸ Pause', '↺ Replay All', 'Edit Config', 'View History'] },
      ],
    },
  ],
  nav: [
    { id: 'live',     label: 'Live',     icon: '◉' },
    { id: 'hooks',    label: 'Hooks',    icon: '⊟' },
    { id: 'logs',     label: 'Logs',     icon: '≡' },
    { id: 'alerts',   label: 'Alerts',   icon: '◈' },
    { id: 'settings', label: 'Settings', icon: '◎' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'hook-mock', 'HOOK — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/hook-mock`);
