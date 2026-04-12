import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CRON',
  tagline:   'Job Scheduling & Observability',
  archetype: 'developer-tools',

  palette: {             // dark
    bg:      '#090C12',
    surface: '#0F1219',
    text:    '#E2E8F5',
    accent:  '#3BFF8C',
    accent2: '#6366F1',
    muted:   'rgba(122,139,173,0.45)',
  },
  lightPalette: {        // light
    bg:      '#F0F4F0',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#16A34A',
    accent2: '#4F46E5',
    muted:   'rgba(13,17,23,0.40)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Jobs',    value: '1,247' },
          { label: 'Success Rate',  value: '99.2%' },
          { label: 'Failed Today',  value: '3' },
        ]},
        { type: 'metric', label: 'Next Run', value: '3m 22s', sub: 'data-sync · */5 * * * *' },
        { type: 'progress', items: [
          { label: 'data-sync',      pct: 100 },
          { label: 'email-digest',   pct: 98  },
          { label: 'cache-warm',     pct: 100 },
          { label: 'db-cleanup',     pct: 95  },
          { label: 'rpt-generate',   pct: 72  },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'data-sync',       sub: '2m ago · 0.72s',      badge: 'OK' },
          { icon: 'check',    title: 'cache-warm',      sub: '3m ago · 0.49s',      badge: 'OK' },
          { icon: 'alert',    title: 'rpt-generate',    sub: '11m ago · timeout',   badge: 'ERR' },
          { icon: 'activity', title: 'db-cleanup',      sub: '3d ago · 4.7s',       badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'jobs', label: 'Jobs',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running',  value: '4'   },
          { label: 'Paused',   value: '1'   },
          { label: 'Failed',   value: '3'   },
        ]},
        { type: 'list', items: [
          { icon: 'play',     title: 'data-sync',        sub: '*/5 * * * *',          badge: 'RUN' },
          { icon: 'check',    title: 'email-digest',     sub: '0 8 * * *',            badge: 'OK'  },
          { icon: 'alert',    title: 'rpt-generate',     sub: '0 6 * * 1',            badge: 'ERR' },
          { icon: 'play',     title: 'cache-warm',       sub: '*/15 * * * *',         badge: 'RUN' },
          { icon: 'check',    title: 'stripe-sync',      sub: '0 * * * *',            badge: 'OK'  },
          { icon: 'star',     title: 'db-cleanup',       sub: '0 3 * * 0',            badge: 'OK'  },
          { icon: 'zap',      title: 'image-optimize',   sub: '0 2 * * *',            badge: 'PSE' },
        ]},
        { type: 'tags', label: 'Environments', items: ['production', 'staging', 'all regions'] },
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'metric', label: 'Log Stream', value: 'LIVE', sub: 'All jobs · real-time' },
        { type: 'list', items: [
          { icon: 'check',    title: 'data-sync #2841',     sub: '09:41:32 — completed 0.72s',  badge: 'INFO' },
          { icon: 'check',    title: 'cache-warm #5502',    sub: '09:41:33 — 412 keys warmed',  badge: 'INFO' },
          { icon: 'alert',    title: 'rpt-generate #0391',  sub: '09:41:35 — timeout 30s',      badge: 'ERR'  },
          { icon: 'activity', title: 'rpt-generate retry',  sub: '09:41:35 — retry 1/3',        badge: 'WARN' },
          { icon: 'check',    title: 'data-sync #2842',     sub: '09:41:38 — completed 0.71s',  badge: 'INFO' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All Jobs', 'data-sync', 'errors only'] },
        { type: 'text', label: 'Active Runs', value: '4 jobs currently executing across 12 workers. Average throughput: 834 executions/hour.' },
      ],
    },
    {
      id: 'monitor', label: 'Monitor',
      content: [
        { type: 'metric-row', items: [
          { label: 'p50',  value: '0.61s' },
          { label: 'p90',  value: '0.83s' },
          { label: 'p99',  value: '1.22s' },
        ]},
        { type: 'progress', items: [
          { label: 'Execution success rate',  pct: 99 },
          { label: 'Avg CPU utilization',     pct: 38 },
          { label: 'Queue saturation',        pct: 12 },
          { label: 'API health score',        pct: 94 },
          { label: 'Alert noise index',       pct: 8  },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'data-sync',      sub: '288 runs today · p90 0.8s',   badge: '✓' },
          { icon: 'activity', title: 'cache-warm',     sub: '96 runs today · p90 0.6s',    badge: '✓' },
          { icon: 'alert',    title: 'rpt-generate',   sub: '1 run today · timed out',     badge: '✗' },
          { icon: 'check',    title: 'email-digest',   sub: '1 run today · p90 1.2s',      badge: '✓' },
        ]},
        { type: 'metric', label: 'Anomaly Score', value: 'Low', sub: 'No unusual patterns detected by AI' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Firing',   value: '1' },
          { label: 'Warning',  value: '1' },
          { label: 'Resolved', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'rpt-generate timeout',  sub: 'Firing · 11m · Slack notified',   badge: '🔴' },
          { icon: 'activity', title: 'data-sync latency',     sub: 'Warning · 2m · p90 elevated',     badge: '🟡' },
          { icon: 'check',    title: 'db-cleanup missed',     sub: 'Resolved · 2d ago',               badge: '✓' },
          { icon: 'check',    title: 'stripe-sync failure',   sub: 'Resolved · 5d ago',               badge: '✓' },
        ]},
        { type: 'tags', label: 'Notify via', items: ['Slack', 'PagerDuty', 'Email', 'Webhook'] },
        { type: 'text', label: 'AI Insight', value: 'rpt-generate has timed out 3× in the last 7 days, all on Monday mornings. Consider increasing timeout or offloading weekly report generation.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home'     },
    { id: 'jobs',      label: 'Jobs',      icon: 'list'     },
    { id: 'logs',      label: 'Logs',      icon: 'activity' },
    { id: 'monitor',   label: 'Monitor',   icon: 'chart'    },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cron-mock', 'CRON — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/cron-mock');
