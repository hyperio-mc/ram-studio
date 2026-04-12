import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Kōdo',
  tagline:   'Engineering intelligence, always on',
  archetype: 'developer-tools',
  palette: {
    bg:      '#070B14',
    surface: '#0F1623',
    text:    '#E2E8F0',
    accent:  '#22D3EE',
    accent2: '#818CF8',
    muted:   'rgba(148,163,184,0.4)',
  },
  lightPalette: {
    bg:      '#F0F4FA',
    surface: '#FFFFFF',
    text:    '#0F1623',
    accent:  '#0891B2',
    accent2: '#6366F1',
    muted:   'rgba(15,22,35,0.4)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'DORA Score', value: '87', sub: '↑ +4 pts this sprint' },
        { type: 'metric-row', items: [
          { label: 'Deploy Freq', value: '4.2/d' },
          { label: 'Lead Time',   value: '1.8h' },
          { label: 'MTTR',        value: '14m' },
        ]},
        { type: 'progress', items: [
          { label: 'Change Fail Rate', pct: 21 },
          { label: 'Deploy Success',   pct: 98 },
          { label: 'PR Merge Rate',    pct: 87 },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Deploy cadence +12% vs last week. PR review time is now your bottleneck.' },
        { type: 'tags', label: 'Signals', items: ['4.2 deploys/day', '23 open PRs', '1 P2 incident', '↓ MTTR 22%'] },
      ],
    },
    {
      id: 'prs', label: 'Pull Requests',
      content: [
        { type: 'metric', label: 'Open PRs', value: '23', sub: '3 waiting >8hrs for review' },
        { type: 'list', items: [
          { icon: 'alert', title: 'feat: streaming context window', sub: '@luna · 2hrs · REVIEW', badge: '⚠' },
          { icon: 'alert', title: 'fix: auth token refresh loop',   sub: '@milo · 8hrs · STALE',  badge: '!' },
          { icon: 'code',  title: 'refactor: query caching layer',  sub: '@dev4 · 1hr · DRAFT',   badge: '…' },
          { icon: 'check', title: 'chore: bump deps to v3.2',       sub: '@dev2 · 3hrs · MERGED', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: '@luna — review load', pct: 66 },
          { label: '@milo — review load', pct: 50 },
          { label: '@sol — review load',  pct: 42 },
        ]},
        { type: 'text', label: 'Bottleneck', value: 'Avg review wait 6.2hrs — longest this sprint. 3 PRs waiting for first review.' },
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric', label: 'Active Incidents', value: '1', sub: 'P2 · checkout latency >2s' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Checkout latency >2s',      sub: 'payments-api · P2 · 34m',  badge: 'P2' },
          { icon: 'alert', title: 'CDN cache miss rate high',   sub: 'cdn-edge · P3 · 2h',       badge: 'P3' },
          { icon: 'alert', title: 'Background job queue lag',   sub: 'workers · P3 · 4h',        badge: 'P3' },
          { icon: 'eye',   title: 'Unused DB connections',      sub: 'postgres · P4 · 1d',       badge: 'P4' },
        ]},
        { type: 'text', label: 'AI Root Cause', value: 'Deploy v2.8.1 changed batch size. Rollback or patch query pool limit to resolve.' },
        { type: 'metric-row', items: [
          { label: 'MTTR Avg', value: '14m' },
          { label: '30d Trend', value: '↓22%' },
          { label: 'On-call', value: '@luna' },
        ]},
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric', label: 'Sprint 12', value: '60%', sub: 'Day 6 of 10 · on track' },
        { type: 'list', items: [
          { icon: 'user', title: '@luna',  sub: 'Lead · PRs: 12 · Rev: 8',  badge: '🔥14d' },
          { icon: 'user', title: '@milo',  sub: 'Senior · PRs: 9 · Rev: 6', badge: '🔥8d'  },
          { icon: 'user', title: '@sol',   sub: 'Mid · PRs: 7 · Rev: 5',    badge: '🔥5d'  },
          { icon: 'user', title: '@dev4',  sub: 'Junior · PRs: 4 · Rev: 2', badge: '🔥3d'  },
        ]},
        { type: 'progress', items: [
          { label: 'Sprint velocity', pct: 60 },
          { label: 'Review coverage', pct: 78 },
          { label: 'Test coverage',   pct: 84 },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'AI Filtered', value: '94%', sub: '6 actionable signals active' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Deploy v2.8.2 error rate +3.1%',  sub: 'AI · 2m ago',  badge: '!' },
          { icon: 'zap',   title: 'PR #412 in review 9h+ stale',     sub: 'PR · 9m ago',  badge: '⚠' },
          { icon: 'check', title: 'Canary v2.8.2 at 25% — stable',   sub: 'Deploy · 18m', badge: '✓' },
          { icon: 'alert', title: 'CPU spike 94% worker-node-3',      sub: 'Infra · 32m',  badge: '⚡' },
          { icon: 'star',  title: 'Sprint velocity 8% below forecast', sub: 'AI · 1h ago', badge: '◈' },
        ]},
        { type: 'tags', label: 'Categories', items: ['AI', 'Deploy', 'PR', 'Infra', 'Team'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home'     },
    { id: 'prs',       label: 'PRs',      icon: 'code'     },
    { id: 'incidents', label: 'Incidents', icon: 'alert'   },
    { id: 'team',      label: 'Team',     icon: 'user'     },
    { id: 'alerts',    label: 'Alerts',   icon: 'bell'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kodo-mock', 'Kōdo — Engineering Intelligence Interactive Mock');
console.log('Mock live at:', result.url);
