import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PLEX',
  tagline:   'Developer team intelligence',
  archetype: 'developer-tooling',

  palette: {
    bg:      '#07090F',
    surface: '#111827',
    text:    '#E2E8F0',
    accent:  '#22D3EE',
    accent2: '#6366F1',
    muted:   'rgba(148,163,184,0.45)',
  },

  lightPalette: {
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#4F46E5',
    muted:   'rgba(15,23,42,0.4)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Deployment Health', value: '98.4%', sub: 'uptime this week' },
        { type: 'metric-row', items: [
          { label: 'Open PRs', value: '23' },
          { label: 'CI Runs', value: '142' },
          { label: 'Active', value: '5/12' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'feat/auth-v2 merged', sub: 'by Alex Kim · 2m ago', badge: '✓' },
          { icon: 'activity', title: 'api-gateway pipeline', sub: 'CI running · 5m ago', badge: '▶' },
          { icon: 'alert', title: 'CPU spike prod-02', sub: 'Monitor alert · 8m ago', badge: '!' },
        ]},
        { type: 'progress', items: [
          { label: 'Code Quality', pct: 94 },
          { label: 'Test Coverage', pct: 87 },
          { label: 'Deploy Success', pct: 98 },
        ]},
      ],
    },
    {
      id: 'pull-requests',
      label: 'Pull Requests',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Open', value: '23' },
          { label: 'Need Review', value: '4' },
          { label: 'Ready', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'feat: OAuth2 refresh token', sub: 'feat/auth-v2 · +284 -12', badge: '✓' },
          { icon: 'code', title: 'fix: race condition queue', sub: 'fix/queue-race · +45 -38', badge: '👁' },
          { icon: 'code', title: 'refactor: migrate to Bun', sub: 'refactor/bun · +1240 -980', badge: '⬜' },
          { icon: 'code', title: 'chore: update deps', sub: 'chore/deps · +18 -5', badge: '✓' },
          { icon: 'code', title: 'feat: bento dashboard v2', sub: 'feat/dashboard · +892', badge: '👁' },
        ]},
        { type: 'tags', label: 'Status Filter', items: ['All', 'Yours', 'Review', 'Draft', 'Merged'] },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Online', value: '5' },
          { label: 'Away', value: '2' },
          { label: 'Offline', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Alex Kim', sub: 'Lead Eng · 12 commits · 2 PRs', badge: '🟢' },
          { icon: 'user', title: 'Bea Lee', sub: 'Backend · 8 commits · 3 PRs', badge: '🟢' },
          { icon: 'user', title: 'Carlos Cruz', sub: 'Frontend · 5 commits · 1 PR', badge: '🟢' },
          { icon: 'user', title: 'Dana Moon', sub: 'DevOps · 18 commits · 0 PRs', badge: '🟢' },
          { icon: 'user', title: 'Erik Sato', sub: 'Security · 3 commits · 2 PRs', badge: '🟢' },
          { icon: 'user', title: 'Fiona Ramos', sub: 'QA · 0 commits · 0 PRs', badge: '🟡' },
        ]},
        { type: 'progress', items: [
          { label: 'Alex (commits)', pct: 60 },
          { label: 'Dana (commits)', pct: 90 },
          { label: 'Bea (commits)', pct: 40 },
        ]},
      ],
    },
    {
      id: 'code-quality',
      label: 'Code Quality',
      content: [
        { type: 'metric', label: 'Overall Score', value: 'A+', sub: '94/100 quality index · ↑+2.4 vs last week' },
        { type: 'progress', items: [
          { label: 'Test Coverage', pct: 87 },
          { label: 'Maintainability', pct: 91 },
          { label: 'Security Score', pct: 96 },
          { label: 'Performance', pct: 78 },
          { label: 'Duplication', pct: 94 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Critical', value: '0' },
          { label: 'Major', value: '3' },
          { label: 'Minor', value: '12' },
          { label: 'Info', value: '47' },
        ]},
      ],
    },
    {
      id: 'deployments',
      label: 'Deploy',
      content: [
        { type: 'metric', label: 'Production · v2.14.3', value: 'Live', sub: '100% traffic · p99 42ms · 0 errors' },
        { type: 'list', items: [
          { icon: 'check', title: 'v2.14.3 → prod', sub: 'by Alex Kim · 2h ago · 3m12s', badge: '🟢' },
          { icon: 'alert', title: 'v2.14.2 → prod', sub: 'by Bea Lee · 1d ago · rolled back', badge: '🔴' },
          { icon: 'check', title: 'v2.14.1 → prod', sub: 'by Carlos · 2d ago · 2m58s', badge: '🟢' },
          { icon: 'check', title: 'v2.14.0 → prod', sub: 'by Dana · 4d ago · 3m04s', badge: '🟢' },
          { icon: 'check', title: 'v2.13.9 → prod', sub: 'by Alex Kim · 5d ago · 3m21s', badge: '🟢' },
        ]},
        { type: 'tags', label: 'Environment', items: ['Production', 'Staging', 'Preview'] },
      ],
    },
    {
      id: 'settings',
      label: 'You',
      content: [
        { type: 'metric', label: 'Alex Kim', value: '98d', sub: 'Lead Engineer · 98-day commit streak' },
        { type: 'metric-row', items: [
          { label: 'Commits', value: '284' },
          { label: 'PRs Merged', value: '47' },
          { label: 'Repos', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'Notifications', sub: 'Slack + Email', badge: '→' },
          { icon: 'settings', title: 'Default branch', sub: 'main', badge: '→' },
          { icon: 'layers', title: 'Review mode', sub: 'Required: 2 approvals', badge: '→' },
          { icon: 'check', title: 'GitHub', sub: 'Connected', badge: '✓' },
          { icon: 'check', title: 'Linear', sub: 'Connected', badge: '✓' },
        ]},
        { type: 'tags', label: 'Theme', items: ['Deep Space', 'Navy', 'Forest', 'Amber'] },
      ],
    },
  ],

  nav: [
    { id: 'dashboard',     label: 'Home',   icon: 'home' },
    { id: 'pull-requests', label: 'Code',   icon: 'code' },
    { id: 'team',          label: 'Team',   icon: 'user' },
    { id: 'deployments',   label: 'Deploy', icon: 'zap' },
    { id: 'settings',      label: 'You',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'plex-mock', 'PLEX — Interactive Mock');
console.log('Mock:', result.status, '→', result.url ?? 'https://ram.zenbin.org/plex-mock');
