import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WARD',
  tagline:   'Incident intelligence for dev teams',
  archetype: 'devops-monitoring',

  palette: {             // dark theme (zinc)
    bg:      '#09090B',
    surface: '#18181B',
    text:    '#FAFAFA',
    accent:  '#6366F1',
    accent2: '#818CF8',
    muted:   'rgba(161,161,170,0.45)',
  },
  lightPalette: {        // light counterpart
    bg:      '#F4F4F5',
    surface: '#FFFFFF',
    text:    '#09090B',
    accent:  '#4F46E5',
    accent2: '#6366F1',
    muted:   'rgba(63,63,70,0.45)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric',     label: 'System Health',  value: '99.87%', sub: 'avg uptime · 12 services' },
        { type: 'metric-row', items: [
          { label: 'Healthy',  value: '10' },
          { label: 'Degraded', value: '1'  },
          { label: 'Down',     value: '1'  },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'notify-svc deployment fail',  sub: 'P1 · 18m ago · still active',  badge: 'P1' },
          { icon: 'activity', title: 'api-gateway high p99',        sub: 'P2 · 3m ago · 842ms p99',      badge: 'P2' },
          { icon: 'check',    title: 'DB connection pool recovered', sub: 'P3 · 2h ago · resolved',       badge: '✓'  },
        ]},
        { type: 'tags', label: 'Active Teams', items: ['Platform', 'Infra', 'Data', 'Product'] },
      ],
    },
    {
      id: 'incident',
      label: 'Incident Detail',
      content: [
        { type: 'metric',     label: 'notify-svc · P1 Active',  value: '18m 04s', sub: 'duration · deployment failure' },
        { type: 'metric-row', items: [
          { label: 'Affected', value: '12,403' },
          { label: 'Services', value: '1'      },
          { label: 'Duration', value: '18m'    },
        ]},
        { type: 'text', label: 'Latest Update', value: 'Rollback initiated to v2.4.0. 60% of containers ready. On-call engineer acknowledged.' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Deployment triggered v2.4.1', sub: '09:23 UTC',                      badge: 'DEP' },
          { icon: 'alert',  title: 'Health checks failing 3/3',   sub: '09:24 UTC',                      badge: 'INC' },
          { icon: 'bell',   title: 'PagerDuty notified',          sub: '09:24 UTC',                      badge: 'ALT' },
          { icon: 'user',   title: 'Engineer acknowledged',       sub: '09:26 UTC · Jordan Hale',        badge: 'ACK' },
        ]},
      ],
    },
    {
      id: 'services',
      label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',    value: '12' },
          { label: 'Healthy',  value: '10' },
          { label: 'Issues',   value: '2'  },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'api-gateway',    sub: 'Platform · p99 842ms · degraded',   badge: 'P2'  },
          { icon: 'check',    title: 'auth-service',   sub: 'Platform · p99 34ms · healthy',     badge: '✓'   },
          { icon: 'check',    title: 'data-sync',      sub: 'Data · p99 120ms · healthy',        badge: '✓'   },
          { icon: 'check',    title: 'web-frontend',   sub: 'Product · p99 210ms · healthy',     badge: '✓'   },
          { icon: 'check',    title: 'worker-fleet',   sub: 'Platform · p99 88ms · healthy',     badge: '✓'   },
          { icon: 'alert',    title: 'notify-svc',     sub: 'Infra · DOWN · deployment failed',  badge: 'P1'  },
        ]},
        { type: 'progress', items: [
          { label: 'api-gateway uptime',  pct: 99 },
          { label: 'auth-service uptime', pct: 100 },
          { label: 'notify-svc uptime',   pct: 91 },
        ]},
      ],
    },
    {
      id: 'oncall',
      label: 'On-Call',
      content: [
        { type: 'metric',     label: 'On-Call Now',  value: 'Jordan Hale', sub: 'Platform · ends in 14h 22m' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Mon Apr 13',  sub: 'Maria Chen · Data',     badge: 'Mon' },
          { icon: 'calendar', title: 'Tue Apr 14',  sub: 'Dev Patel · Infra',     badge: 'Tue' },
          { icon: 'calendar', title: 'Wed Apr 15',  sub: 'Aiko Tanaka · Product', badge: 'Wed' },
          { icon: 'calendar', title: 'Thu–Fri',     sub: 'Sam Okonkwo · Platform', badge: 'Thu' },
        ]},
        { type: 'tags', label: 'Coverage', items: ['Platform', 'Infra', 'Data', 'Product'] },
        { type: 'text', label: 'Escalation Path', value: 'L1 → On-Call Engineer → Team Lead → VP Engineering. Auto-escalates after 15 min silence.' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alert Rules',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Rules', value: '8'  },
          { label: 'Firing Now',   value: '2'  },
          { label: 'Silenced',     value: '1'  },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'p99 > 500ms',         sub: 'api-gateway · PagerDuty · P2 · FIRING',   badge: '⚡' },
          { icon: 'zap',      title: 'Deploy failure',      sub: 'all services · PagerDuty · P1 · FIRING',  badge: '⚡' },
          { icon: 'bell',     title: 'Error rate > 5%',     sub: 'all services · Slack #alerts · P1',       badge: 'P1' },
          { icon: 'bell',     title: 'Uptime < 99.9%',      sub: 'web-frontend · Email · P3',               badge: 'P3' },
          { icon: 'bell',     title: 'Memory > 90%',        sub: 'worker-fleet · Email · P3',               badge: 'P3' },
        ]},
        { type: 'tags', label: 'Channels', items: ['PagerDuty', 'Slack', 'Email', 'Webhook'] },
      ],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: [
        { type: 'metric',     label: 'Today',  value: '47 Events', sub: 'Last 24 hours · 2 incidents' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'notify-svc deployment fail', sub: '09:24 · P1 · still active',   badge: 'INC' },
          { icon: 'code',     title: 'Deploy notify-svc v2.4.1',   sub: '09:23 · Infra team',          badge: 'DEP' },
          { icon: 'activity', title: 'api-gateway p99 spike',      sub: '09:20 · alert fired',         badge: 'ALT' },
          { icon: 'code',     title: 'Deploy auth-service v3.1',   sub: '08:55 · Platform team',       badge: 'DEP' },
          { icon: 'check',    title: 'DB conn pool recovered',     sub: '07:33 · P3 resolved',         badge: '✓'   },
          { icon: 'activity', title: 'Memory > 90% on worker',     sub: '06:10 · auto-cleared',        badge: 'ALT' },
        ]},
        { type: 'progress', items: [
          { label: 'Incidents resolved same-day', pct: 85 },
          { label: 'Alerts resolved < 30 min',    pct: 72 },
          { label: 'On-call acknowledged < 5 min', pct: 94 },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'grid'     },
    { id: 'services',  label: 'Services',  icon: 'layers'   },
    { id: 'oncall',    label: 'On-Call',   icon: 'user'     },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell'     },
    { id: 'timeline',  label: 'Timeline',  icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'ward-mock', 'WARD — Interactive Mock');
console.log('Mock live at:', result.url || `https://ram.zenbin.org/ward-mock`);
console.log('Status:', result.status);
