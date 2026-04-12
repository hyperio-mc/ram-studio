import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Flint',
  tagline:   'PR review load, made legible',
  archetype: 'developer-tools',

  palette: {
    bg:      '#1A1816',
    surface: '#252220',
    text:    '#F6F4F0',
    accent:  '#5B8BFF',
    accent2: '#FF7850',
    muted:   'rgba(246,244,240,0.4)',
  },

  lightPalette: {
    bg:      '#F6F4F0',
    surface: '#FFFFFF',
    text:    '#141210',
    accent:  '#2C5EE8',
    accent2: '#E05C3A',
    muted:   'rgba(20,18,16,0.40)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open PRs', value: '34' },
          { label: 'Avg days', value: '3.2' },
          { label: 'Blocked',  value: '6'  },
        ]},
        { type: 'tags', label: 'Status', items: ['18 In Review', '10 Approved', '6 Blocked', '4 Stale'] },
        { type: 'progress', items: [
          { label: 'In Review',  pct: 53 },
          { label: 'Approved',   pct: 29 },
          { label: 'Blocked',    pct: 18 },
        ]},
        { type: 'metric', label: 'Merge Rate (this week)', value: '+24%', sub: '21 merged vs 17 last week' },
        { type: 'list', items: [
          { icon: 'chart', title: 'Priya K.',  sub: '12 PRs · 92% loaded', badge: 'OVER'   },
          { icon: 'chart', title: 'Carlos M.', sub: '11 PRs · 84% loaded', badge: 'HIGH'   },
          { icon: 'chart', title: 'Mei L.',    sub: '6 PRs · 46% loaded',  badge: 'OK'     },
        ]},
      ],
    },
    {
      id: 'queue', label: 'Queue',
      content: [
        { type: 'metric', label: 'Open Pull Requests', value: '34', sub: '6 blocked · 18 awaiting review' },
        { type: 'list', items: [
          { icon: 'alert',  title: 'auth middleware cleanup',   sub: 'api-core · priya · 4d',  badge: 'BLOCKED'  },
          { icon: 'eye',    title: 'webhook retry with backoff',sub: 'events · carlos · 2d',   badge: 'REVIEW'   },
          { icon: 'filter', title: 'race condition in workers', sub: 'workers · mei · 6d',     badge: 'STALE'    },
          { icon: 'layers', title: 'multi-tenant org switching',sub: 'app · jordan · 1d',      badge: 'REVIEW'   },
          { icon: 'check',  title: 'update eslint to v9',       sub: 'shared · priya · 3d',   badge: 'APPROVED' },
          { icon: 'alert',  title: 'dashboard metric caching',  sub: 'api-core · carlos · 5d',badge: 'BLOCKED'  },
          { icon: 'eye',    title: 'e2e tests for billing flow', sub: 'app · mei · 1d',        badge: 'REVIEW'   },
        ]},
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Utilisation', value: '73%' },
          { label: 'Overloaded',  value: '2'   },
          { label: 'Avg PRs',     value: '7.3' },
        ]},
        { type: 'progress', items: [
          { label: 'Priya K. (92%)',  pct: 92 },
          { label: 'Carlos M. (84%)', pct: 84 },
          { label: 'Aisha R. (62%)',  pct: 62 },
          { label: 'Mei L. (46%)',    pct: 46 },
          { label: 'Jordan T. (38%)', pct: 38 },
          { label: 'Dev P. (15%)',    pct: 15 },
        ]},
        { type: 'text', label: 'Capacity Alert', value: 'Priya + Carlos above 80% load. Consider redistributing 3 PRs from Priya to Dev.' },
      ],
    },
    {
      id: 'velocity', label: 'Velocity',
      content: [
        { type: 'metric-row', items: [
          { label: 'Median',  value: '2.1d' },
          { label: 'p75',     value: '4.8d' },
          { label: 'p95',     value: '11d'  },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Week 1 (this week)',  sub: '21 merged, 9 opened', badge: '+12' },
          { icon: 'calendar', title: 'Week 2',              sub: '14 merged, 13 opened',badge: '+1'  },
          { icon: 'calendar', title: 'Week 3',              sub: '16 merged, 11 opened',badge: '+5'  },
          { icon: 'calendar', title: 'Week 4',              sub: '12 merged, 15 opened',badge: '-3'  },
        ]},
        { type: 'metric', label: 'Time to First Review', value: '3.4h', sub: 'Down from 5.1h last cycle — ↓33%' },
        { type: 'progress', items: [
          { label: 'Merge throughput', pct: 87 },
          { label: 'Review velocity',  pct: 74 },
          { label: 'PR health score',  pct: 68 },
        ]},
      ],
    },
    {
      id: 'blockers', label: 'Blockers',
      content: [
        { type: 'metric', label: 'Blocked Pull Requests', value: '6', sub: 'Holding back 3 team members' },
        { type: 'list', items: [
          { icon: 'alert', title: 'auth middleware cleanup',    sub: 'Waiting on security review · 4d',     badge: '⚠' },
          { icon: 'alert', title: 'billing webhook retry',      sub: 'Merge conflicts with main · 3d',      badge: '⚠' },
          { icon: 'alert', title: 'race condition in workers',  sub: 'CI failing — flaky e2e test · 6d',    badge: '⚠' },
          { icon: 'alert', title: 'upgrade postgres client',    sub: 'Breaking change in migration · 5d',   badge: '⚠' },
          { icon: 'alert', title: 'org-level API keys',         sub: 'Design review pending · 2d',          badge: '⚠' },
        ]},
        { type: 'tags', label: 'Blocker types', items: ['Conflict', 'CI Failing', 'Needs Review', 'Design Gate'] },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Overview',  icon: 'home'     },
    { id: 'queue',     label: 'Queue',     icon: 'list'     },
    { id: 'team',      label: 'Team',      icon: 'user'     },
    { id: 'velocity',  label: 'Velocity',  icon: 'activity' },
    { id: 'blockers',  label: 'Blockers',  icon: 'alert'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug:    'flint-mock',
});
const result = await publishMock(html, 'flint-mock', 'Flint — Interactive Mock');
console.log('Mock live at:', result.url);
