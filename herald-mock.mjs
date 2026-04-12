import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HERALD',
  tagline:   'Your team\'s pulse, without the meetings.',
  archetype: 'team-intelligence',
  palette: {
    bg:      '#1A1730',
    surface: '#252240',
    text:    '#F0EEF8',
    accent:  '#7C5FF7',
    accent2: '#E8961A',
    muted:   'rgba(240,238,248,0.45)',
  },
  lightPalette: {
    bg:      '#F4F3EF',
    surface: '#FFFFFF',
    text:    '#141318',
    accent:  '#5B3CF5',
    accent2: '#D9860A',
    muted:   'rgba(20,19,24,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Team Pulse', value: '8.4', sub: 'out of 10 — ↑ 0.6 vs last week' },
        { type: 'metric-row', items: [
          { label: 'Updated', value: '8/9' },
          { label: 'Blocked', value: '2' },
          { label: 'PRs Merged', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Priya S. — Blocked', sub: 'Auth PR failing CI — needs review', badge: '4h' },
          { icon: 'alert', title: 'Marcus L. — Waiting', sub: 'Needs design spec for Onboarding V2', badge: '1d' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Sam K. shipped search redesign', sub: '40ms p99 improvement', badge: '✓' },
          { icon: 'check', title: 'Yui T. cleared support backlog', sub: '8 tickets closed today', badge: '✓' },
        ]},
        { type: 'text', label: 'Herald Agent', value: 'Collected 8 standups via Slack · 5 PRs via GitHub · synced 9:02am' },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric', label: 'Members', value: '9', sub: '8 updated today · 1 no update' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Priya S. · Backend', sub: 'Blocked — Auth PR stuck in CI', badge: '🚫' },
          { icon: 'activity', title: 'Sam K. · Frontend', sub: 'Shipped — Search redesign live', badge: '🚀' },
          { icon: 'activity', title: 'Yui T. · Support', sub: 'Active — Cleared 8 tickets', badge: '💪' },
          { icon: 'activity', title: 'Eli M. · Docs', sub: 'Active — API docs complete', badge: '✅' },
          { icon: 'activity', title: 'Dani R. · Infra', sub: 'Active — K8s staging upgrade', badge: '🔧' },
          { icon: 'activity', title: 'Zora P. · PM', sub: 'In meeting — Sprint planning', badge: '📋' },
        ]},
      ],
    },
    {
      id: 'feed',
      label: 'Feed',
      content: [
        { type: 'tags', label: 'Sources', items: ['All', 'Slack', 'GitHub', 'Linear'] },
        { type: 'list', items: [
          { icon: 'share', title: 'Sam K. via Slack', sub: '🚀 Shipped search redesign. 40ms p99 gain.', badge: '9:02' },
          { icon: 'alert', title: 'Priya S. via GitHub', sub: 'PR #847 blocked — CI fails on step 3', badge: '8:54' },
          { icon: 'calendar', title: 'Zora P. via Linear', sub: 'Sprint 22 locked. 18 pts committed.', badge: '9:15' },
          { icon: 'star', title: 'Yui T. via Slack', sub: '💪 8 tickets closed. Avg response 23min.', badge: '10:04' },
        ]},
      ],
    },
    {
      id: 'work',
      label: 'Work',
      content: [
        { type: 'metric', label: 'Sprint 22', value: '56%', sub: 'complete · 7 days remaining · 18 pts' },
        { type: 'progress', items: [
          { label: 'Search Redesign', pct: 100 },
          { label: 'Auth Hardening', pct: 65 },
          { label: 'Onboarding V2', pct: 20 },
          { label: 'K8s Upgrade', pct: 80 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Search Redesign', sub: 'Shipped · Sam K. lead', badge: '✓' },
          { icon: 'alert', title: 'Auth Hardening', sub: 'Blocked · Priya S. lead', badge: '⚠' },
          { icon: 'eye', title: 'Onboarding V2', sub: 'In design · Marcus L.', badge: '●' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Week in Review', value: 'Strong', sub: 'Above-average velocity and low blocker rate' },
        { type: 'metric-row', items: [
          { label: 'Update time', value: '9:12am' },
          { label: 'Blockers/wk', value: '2.1' },
          { label: 'Mood', value: '7.8/10' },
        ]},
        { type: 'progress', items: [
          { label: 'W49', pct: 61 },
          { label: 'W50', pct: 100 },
          { label: 'W51', pct: 78 },
          { label: 'W52 (this week)', pct: 89 },
        ]},
        { type: 'text', label: 'AI Summary', value: 'Strong delivery week. Search redesign shipped (40ms gain), support backlog cleared, sprint 56% done. Watch: Auth CI block and Onboarding V2 spec gap may threaten Q2.' },
        { type: 'list', items: [
          { icon: 'star', title: 'MVP: Sam K.', sub: '5 PRs merged · 0 blockers · full delivery', badge: '🏆' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',   icon: 'home'     },
    { id: 'team',     label: 'Team',    icon: 'user'     },
    { id: 'feed',     label: 'Feed',    icon: 'message'  },
    { id: 'work',     label: 'Work',    icon: 'layers'   },
    { id: 'insights', label: 'Insights',icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'herald-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
