import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CHISEL',
  tagline:   'AI pull-request analytics',
  archetype: 'dev-tools',

  palette: {
    bg:      '#080A0D',
    surface: '#0F1218',
    text:    '#E2E8F0',
    accent:  '#F59E0B',
    accent2: '#3B82F6',
    muted:   'rgba(148,163,184,0.45)',
  },
  lightPalette: {
    bg:      '#F8FAFC',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#D97706',
    accent2: '#2563EB',
    muted:   'rgba(15,23,42,0.4)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open PRs', value: '47' },
          { label: 'Avg Review', value: '18h' },
          { label: 'Merged', value: '124' },
        ]},
        { type: 'metric', label: 'Sprint Velocity', value: '57%', sub: 'Day 8 of 14 · slightly behind ideal' },
        { type: 'list', items: [
          { icon: 'code', title: '#2341 feat: async pipeline v2', sub: '@jana.m · 3h ago · +142 −38', badge: 'L' },
          { icon: 'check', title: '#2338 fix: auth race condition', sub: '@devraj · 5h ago · +48 −12', badge: 'S' },
          { icon: 'alert', title: '#2335 chore: dep update Q2', sub: '@theo.p · 1d ago · CI failing', badge: 'M' },
        ]},
        { type: 'text', label: '⚡ AI Digest', value: '3 PRs need attention · auth module has high churn · 2 merge conflicts detected' },
      ],
    },
    {
      id: 'queue',
      label: 'Review Queue',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Mine', 'Stale', 'Blocked', 'Ready'] },
        { type: 'list', items: [
          { icon: 'code', title: '#2341 feat: async pipeline v2', sub: '@jana.m · L · 3h · Review', badge: '✓12' },
          { icon: 'code', title: '#2338 fix: auth race condition', sub: '@devraj · S · 5h · Review', badge: '✓8' },
          { icon: 'alert', title: '#2335 chore: dep update Q2', sub: '@theo.p · M · 1d · Open', badge: '✗1' },
          { icon: 'code', title: '#2330 refactor: logging module', sub: '@yuki · M · 2d · Open', badge: '✓6' },
          { icon: 'code', title: '#2318 feat: webhooks v3 spec', sub: '@ami.r · L · 4d · Open', badge: '✓14' },
          { icon: 'code', title: '#2299 fix: memory leak worker', sub: '@ben.k · S · 6d · Open', badge: '✓5' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Assigned to me', value: '8' },
          { label: 'Awaiting CI', value: '5' },
          { label: 'Stale (>5d)', value: '3' },
        ]},
      ],
    },
    {
      id: 'pr-detail',
      label: 'PR Detail',
      content: [
        { type: 'metric', label: '#2341 feat: async pipeline v2', value: 'Open', sub: '@jana.m · 3h ago · 6 files changed' },
        { type: 'tags', label: 'Changed Files', items: [
          'src/pipeline/async.ts',
          'src/pipeline/types.ts',
          'tests/pipeline.test.ts',
          '+3 more files',
        ]},
        { type: 'text', label: 'Diff Preview', value: '− const queue = new Queue(opts)\n+ const queue = await Queue.create(opts, {\n+   concurrency: opts.workers ?? 4,\n+   timeout: opts.timeout ?? 30_000,\n+ })' },
        { type: 'list', items: [
          { icon: 'check', title: 'jana.m — approved', sub: 'Code looks clean, nice refactor', badge: '✓' },
          { icon: 'eye', title: 'devraj — pending', sub: 'Reviewing concurrency logic', badge: '◎' },
          { icon: 'eye', title: 'theo.p — pending', sub: 'Requested as reviewer', badge: '◎' },
        ]},
        { type: 'progress', items: [
          { label: 'test:unit (48/48)', pct: 100 },
          { label: 'lint:typescript', pct: 100 },
          { label: 'build:docker', pct: 30 },
        ]},
      ],
    },
    {
      id: 'velocity',
      label: 'Velocity',
      content: [
        { type: 'metric', label: 'Sprint 24 Burndown', value: '57%', sub: 'Day 8 of 14 · 28 pts done · 21 pts left' },
        { type: 'progress', items: [
          { label: 'jana.m — 8 PRs', pct: 100 },
          { label: 'devraj — 6 PRs', pct: 75 },
          { label: 'yuki — 5 PRs', pct: 63 },
          { label: 'theo.p — 4 PRs', pct: 50 },
          { label: 'ami.r — 3 PRs', pct: 38 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total PRs', value: '26' },
          { label: 'Reviews', value: '60' },
          { label: 'Lines +', value: '3.3k' },
        ]},
        { type: 'text', label: 'Trend', value: 'Team velocity up 12% vs Sprint 23. Review time down from 22h → 18h avg. Auth module remains high-churn.' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: '⚡ AI Summary', value: 'High PR churn detected in auth module. 3 files modified in 8 of last 12 PRs. Consider splitting session.ts.' },
        { type: 'progress', items: [
          { label: 'src/auth/session.ts — HIGH', pct: 88 },
          { label: 'src/pipeline/queue.ts — MED', pct: 62 },
          { label: 'src/api/routes.ts — MED', pct: 44 },
          { label: 'src/utils/cache.ts — LOW', pct: 21 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Split auth/session.ts', sub: 'Exceeds 400 LOC complexity threshold', badge: '!' },
          { icon: 'code', title: 'Add integration tests', sub: 'Pipeline queue edge cases uncovered', badge: '↑' },
          { icon: 'lock', title: 'Require reviews for /auth/*', sub: 'Enable CODEOWNERS path protection', badge: '→' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Risk Score', value: '88' },
          { label: 'Hot Files', value: '4' },
          { label: 'Suggestions', value: '3' },
        ]},
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'Jana Müller', value: 'Pro ⚡', sub: '@jana.m · Team Lead · hyperio-mc' },
        { type: 'list', items: [
          { icon: 'code', title: 'GitHub', sub: 'hyperio-mc · 3 repos connected', badge: '●' },
          { icon: 'message', title: 'Slack', sub: '#eng-prs · digest enabled', badge: '●' },
          { icon: 'layers', title: 'Linear', sub: 'SP-24 linked · auto-close enabled', badge: '●' },
          { icon: 'grid', title: 'Jira', sub: 'Not connected', badge: '+' },
          { icon: 'activity', title: 'Datadog', sub: 'Not connected', badge: '+' },
        ]},
        { type: 'tags', label: 'Notifications', items: ['PR assigned', 'CI failure', 'Merge conflict', 'Stale alert'] },
        { type: 'text', label: 'Account', value: 'Pro plan · 12 seats · renews May 1, 2026' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Board', icon: 'grid' },
    { id: 'queue',     label: 'Queue', icon: 'list' },
    { id: 'velocity',  label: 'Velocity', icon: 'activity' },
    { id: 'insights',  label: 'Insights', icon: 'eye' },
    { id: 'settings',  label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'chisel-mock', 'CHISEL — Interactive Mock');
console.log('Mock live at:', result.url || `https://ram.zenbin.org/chisel-mock`);
console.log('Status:', result.status);
