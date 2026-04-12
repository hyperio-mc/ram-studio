import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BENTO',
  tagline:   'Feature Command Center',
  archetype: 'product-ops',
  palette: {
    bg:      '#09090D',
    surface: '#141620',
    text:    '#F1F5F9',
    accent:  '#818CF8',
    accent2: '#34D399',
    muted:   'rgba(148,163,184,0.45)',
  },
  lightPalette: {
    bg:      '#F8F7FF',
    surface: '#FFFFFF',
    text:    '#1E1B3A',
    accent:  '#6366F1',
    accent2: '#059669',
    muted:   'rgba(30,27,58,0.4)',
  },
  screens: [
    {
      id: 'grid',
      label: 'Grid',
      content: [
        { type: 'metric', label: 'Features Shipped', value: '47', sub: 'Q2 · ↑ 12 from last quarter' },
        { type: 'metric-row', items: [
          { label: 'Live Now', value: '23' },
          { label: 'In Review', value: '8' },
          { label: 'Blocked', value: '2' },
        ]},
        { type: 'progress', items: [
          { label: 'Roadmap completion', pct: 71 },
          { label: 'Adoption rate',      pct: 84 },
          { label: 'Test coverage',      pct: 92 },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'AI Summarize',   sub: 'Beta · 82% rollout',   badge: '82%' },
          { icon: 'check',  title: 'Dark Mode',       sub: 'Live · 100%',          badge: '100%' },
          { icon: 'alert',  title: 'Bulk Actions',    sub: 'Staging · Blocked',    badge: '⚑' },
          { icon: 'code',   title: 'API v2',           sub: 'Build · 28% done',    badge: '28%' },
        ]},
      ],
    },
    {
      id: 'launch',
      label: 'Launch',
      content: [
        { type: 'metric', label: 'AI Summarize · Rollout', value: '82%', sub: 'Beta · v2.1.4 · DAU: 2.4K' },
        { type: 'metric-row', items: [
          { label: 'DAU', value: '2.4K' },
          { label: 'CSAT', value: '4.8★' },
          { label: 'Latency', value: '340ms' },
        ]},
        { type: 'progress', items: [
          { label: 'Spec finalized',     pct: 100 },
          { label: 'Dev complete',       pct: 100 },
          { label: 'Internal beta',      pct: 100 },
          { label: '10% rollout',        pct: 100 },
          { label: 'Full GA release',    pct: 40 },
        ]},
        { type: 'text', label: 'Status', value: 'On track for April 15 GA. No critical blockers. CSAT holding strong at 4.8.' },
      ],
    },
    {
      id: 'health',
      label: 'Health',
      content: [
        { type: 'metric', label: 'Overall Health Score', value: '96', sub: 'Excellent — no critical issues' },
        { type: 'metric-row', items: [
          { label: 'Uptime',     value: '99.97%' },
          { label: 'Error Rate', value: '0.02%' },
          { label: 'P95 Latency', value: '210ms' },
        ]},
        { type: 'progress', items: [
          { label: 'AI Summarize',  pct: 98 },
          { label: 'Dark Mode',     pct: 100 },
          { label: 'CSV Export',    pct: 91 },
          { label: 'Bulk Actions',  pct: 87 },
          { label: 'API v2',        pct: 74 },
        ]},
        { type: 'tags', label: 'Active Alerts', items: ['0 P0 Bugs', '0 Incidents', '3 Warnings'] },
      ],
    },
    {
      id: 'queue',
      label: 'Queue',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Sprint', value: '4' },
          { label: 'Blocked',     value: '2' },
          { label: 'Ready',       value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Team Mentions',  sub: 'Apr 14 · 90% done',   badge: '✓' },
          { icon: 'activity', title: 'Audit Logs',     sub: 'Apr 14 · 75% done',   badge: '✓' },
          { icon: 'alert',    title: 'SSO Provider',   sub: 'Apr 21 · Blocked',     badge: '⚑' },
          { icon: 'code',     title: 'Webhooks v3',    sub: 'Apr 21 · 40% done',   badge: '' },
          { icon: 'code',     title: 'Slack Notifs',   sub: 'May 1 · 25% done',    badge: '' },
          { icon: 'alert',    title: 'Export PDF',     sub: 'May 1 · Blocked',      badge: '⚑' },
        ]},
        { type: 'text', label: 'Sprint Note', value: '2 of 6 items blocked. SSO waiting on OAuth provider creds. Export PDF needs design sign-off.' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Shipped Q2', value: '47' },
          { label: 'Velocity',   value: '94%' },
          { label: 'CSAT Avg',   value: '4.7' },
        ]},
        { type: 'progress', items: [
          { label: 'Core Product',    pct: 42 },
          { label: 'Integrations',    pct: 28 },
          { label: 'Infrastructure',  pct: 18 },
          { label: 'Design System',   pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Kiran M.',  sub: 'Feature Lead',  badge: '14' },
          { icon: 'star',     title: 'Alex T.',   sub: 'Backend',       badge: '11' },
          { icon: 'star',     title: 'Ren B.',    sub: 'Design',        badge: '9' },
        ]},
        { type: 'text', label: 'Quarter Insight', value: 'Q2 velocity up 8% over Q1. Core product features driving adoption. 3 engineers consistently above target.' },
      ],
    },
  ],
  nav: [
    { id: 'grid',     label: 'Grid',    icon: 'grid' },
    { id: 'launch',   label: 'Launch',  icon: 'zap' },
    { id: 'health',   label: 'Health',  icon: 'activity' },
    { id: 'queue',    label: 'Queue',   icon: 'list' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'bento-mock', 'BENTO — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/bento-mock');
