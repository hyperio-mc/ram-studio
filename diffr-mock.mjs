import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DIFFR',
  tagline:   'AI code review at terminal speed',
  archetype: 'dev-tooling',
  palette: {           // dark — terminal black + chartreuse
    bg:      '#030303',
    surface: '#0A0A0A',
    text:    '#E8E8E8',
    accent:  '#C8FF00',
    accent2: '#00FF94',
    muted:   'rgba(200,255,0,0.25)',
  },
  lightPalette: {
    bg:      '#F0F0EC',
    surface: '#FAFAFA',
    text:    '#111111',
    accent:  '#5A7A00',
    accent2: '#007A50',
    muted:   'rgba(90,122,0,0.18)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'REVIEWS_PENDING', value: '24', sub: '61 total open PRs this week' },
        { type: 'metric-row', items: [
          { label: 'MERGED', value: '37' },
          { label: 'BLOCKED', value: '8' },
          { label: 'AVG_TIME', value: '1.4h' },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: '#2847 streaming response handler', sub: '@kira · 14m · AI_READY', badge: 'AI' },
          { icon: 'activity', title: '#2846 race condition in queue pool', sub: '@tom · 1h · REVIEWING', badge: '→' },
          { icon: 'alert', title: '#2845 auth middleware cleanup', sub: '@priya · 3h · BLOCKED', badge: '⚑' },
          { icon: 'check', title: '#2844 update dep lockfile', sub: '@dev · 6h · APPROVED', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'diff-view',
      label: 'Diff View',
      content: [
        { type: 'text', label: '#2847 · feat: streaming response handler', value: '@kira → main · 7 files changed · AI_READY' },
        { type: 'tags', label: 'FILES', items: ['handler.ts', 'queue.ts', 'types.ts', '+3 more'] },
        { type: 'list', items: [
          { icon: 'plus', title: '+ const ctrl = new AbortController()', sub: 'line 45 · addition', badge: '+' },
          { icon: 'plus', title: '+ const timer = setTimeout(abort)', sub: 'line 46 · addition', badge: '+' },
          { icon: 'minus', title: '- const resp = await fetch(endpoint)', sub: 'line 43 · removed', badge: '-' },
          { icon: 'zap', title: 'AI: Consider error recovery for partial streams', sub: 'Timeout handling looks solid — add retry limit', badge: 'AI' },
        ]},
        { type: 'metric-row', items: [{ label: 'ADDITIONS', value: '+143' }, { label: 'DELETIONS', value: '-12' }, { label: 'FILES', value: '7' }]},
      ],
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      content: [
        { type: 'metric', label: 'CONFIDENCE_SCORE', value: '94%', sub: 'High confidence — safe to merge' },
        { type: 'progress', items: [
          { label: 'Critical issues', pct: 0 },
          { label: 'Warnings', pct: 25 },
          { label: 'Suggestions', pct: 70 },
          { label: 'Info', pct: 30 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Add memoization to getStreamChunks()', sub: 'PERF · View in diff', badge: 'P' },
          { icon: 'code', title: 'Prefer named exports for tree-shaking', sub: 'STYLE · View in diff', badge: 'S' },
          { icon: 'alert', title: 'Validate origin before echoing back', sub: 'SEC · View in diff', badge: '!' },
          { icon: 'eye', title: 'Edge case: empty stream returns undefined', sub: 'LOGIC · View in diff', badge: 'L' },
        ]},
      ],
    },
    {
      id: 'review-queue',
      label: 'Review Queue',
      content: [
        { type: 'metric-row', items: [{ label: 'ALL', value: '24' }, { label: 'MINE', value: '6' }, { label: 'AI_READY', value: '11' }]},
        { type: 'list', items: [
          { icon: 'code', title: '#2847 streaming response handler', sub: 'kira · api-core · 7 files · +143 -12', badge: 'AI' },
          { icon: 'activity', title: '#2846 race condition in queue pool', sub: 'tom · api-core · 3 files · +28 -45', badge: '→' },
          { icon: 'alert', title: '#2845 auth middleware refactor', sub: 'priya · auth-svc · 12 files · +290', badge: '⚑' },
          { icon: 'check', title: '#2843 dependency lockfile update', sub: 'bot · dashboard · 1 file · +12', badge: '✓' },
          { icon: 'code', title: '#2841 auto-scaling policy for prod', sub: 'ops · infra · 5 files · +67', badge: 'AI' },
        ]},
      ],
    },
    {
      id: 'team-feed',
      label: 'Team Feed',
      content: [
        { type: 'metric', label: 'TEAM_VELOCITY', value: '↑19%', sub: '12-week sprint — personal best' },
        { type: 'list', items: [
          { icon: 'code', title: '@kira opened #2847 streaming handler', sub: '14m ago', badge: '◈' },
          { icon: 'zap', title: 'AI analyzed #2847 → 94% confidence', sub: '13m ago · 7 issues found', badge: '▲' },
          { icon: 'check', title: '@tom approved #2840 auth token refresh', sub: '32m ago', badge: '✓' },
          { icon: 'alert', title: '@priya blocked #2845 security review', sub: '1h ago', badge: '⚑' },
          { icon: 'share', title: '@kira merged #2838 to production', sub: '4h ago', badge: '⬆' },
        ]},
      ],
    },
    {
      id: 'config',
      label: 'Config',
      content: [
        { type: 'metric', label: 'PROFILE', value: 'kira', sub: 'Senior Engineer · PRO_PLAN · kira@diffr.dev' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Auto-analyze on push', sub: 'AI_BEHAVIOR', badge: 'ON' },
          { icon: 'settings', title: 'Confidence threshold', sub: 'AI_BEHAVIOR', badge: '80%' },
          { icon: 'bell', title: 'PR ready for review', sub: 'NOTIFICATIONS', badge: 'PUSH' },
          { icon: 'alert', title: 'Blocked PRs', sub: 'NOTIFICATIONS', badge: 'ALL' },
        ]},
        { type: 'tags', label: 'AI_MODEL', items: ['GPT-4o', 'Claude 3.5', 'Gemini Pro'] },
        { type: 'text', label: 'VERSION', value: 'v3.14.2 · RAM Design Heartbeat #393 · diffr.dev' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Dash',    icon: 'home' },
    { id: 'review-queue', label: 'Reviews', icon: 'list' },
    { id: 'diff-view',    label: 'Diff',    icon: 'code' },
    { id: 'team-feed',    label: 'Feed',    icon: 'activity' },
    { id: 'config',       label: 'Config',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'diffr-mock', 'DIFFR — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/diffr-mock');
