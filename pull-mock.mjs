import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PULL',
  tagline:   'AI code review, at team velocity',
  archetype: 'developer-productivity',
  palette: {
    bg:      '#0B0D12',
    surface: '#111520',
    text:    '#E2E8F8',
    accent:  '#4F9EFF',
    accent2: '#8B5CF6',
    muted:   'rgba(136,153,187,0.45)',
  },
  lightPalette: {
    bg:      '#F0F4FA',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#2563EB',
    accent2: '#7C3AED',
    muted:   'rgba(15,23,42,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open PRs', value: '23' },
          { label: 'Coverage', value: '87%' },
          { label: 'Merged', value: '11' },
        ]},
        { type: 'metric', label: 'AI Quality Score', value: '9.1', sub: '/10 across all PRs this week' },
        { type: 'list', items: [
          { icon: 'code', title: 'feat: add payment gateway', sub: 'sarah.kim · +142 lines · AI 8.4', badge: '⊙' },
          { icon: 'check', title: 'fix: race condition in auth', sub: 'dev.li · +18 lines · AI 9.6', badge: '✓' },
          { icon: 'alert', title: 'refactor: db connection pool', sub: 'r.cohen · +96 lines · AI 7.2', badge: '!' },
        ]},
        { type: 'progress', items: [
          { label: 'Review Coverage', pct: 87 },
          { label: 'Auto-approve Rate', pct: 34 },
          { label: 'First-pass Merge', pct: 62 },
        ]},
        { type: 'text', label: 'Cycle Time', value: '4.2h average — ↓ 0.8h vs last week. AI is catching issues before review, reducing back-and-forth.' },
      ],
    },
    {
      id: 'pr-queue',
      label: 'PR Queue',
      content: [
        { type: 'metric-row', items: [
          { label: 'Yours', value: '5' },
          { label: 'Waiting', value: '8' },
          { label: 'Stale', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: '#284 feat: add Stripe payment gateway', sub: 'sarah.kim · 7 files · AI 8.4', badge: '⊙' },
          { icon: 'check', title: '#283 fix: race condition in auth flow', sub: 'dev.li · 2 files · AI 9.6', badge: '✓' },
          { icon: 'alert', title: '#282 refactor: db connection pool', sub: 'r.cohen · 6 files · AI 7.2', badge: '!' },
          { icon: 'code', title: '#281 docs: update API reference', sub: 'e.santos · 12 files · AI 9.1', badge: '✓' },
          { icon: 'code', title: '#279 feat: dark mode for dashboard', sub: 'ana.t · 14 files · AI 7.8', badge: '⊙' },
        ]},
        { type: 'tags', label: 'Filter by State', items: ['All (23)', 'Yours (5)', 'Waiting (8)', 'Approved (6)', 'Stale (2)'] },
      ],
    },
    {
      id: 'pr-detail',
      label: 'PR Detail',
      content: [
        { type: 'metric', label: '#284 — Status', value: '↻', sub: 'Changes requested · sarah.kim · 2m ago' },
        { type: 'text', label: '◈ AI Analysis — Score 8.4/10', value: '✓ Good separation of concerns\n✓ Stripe webhook validation robust\n⚠ Missing error handling in payment retry\n✕ API key exposed in test fixtures — critical' },
        { type: 'list', items: [
          { icon: 'code', title: 'src/payments/stripe.ts', sub: '+142 −8 · 7 AI annotations', badge: '8.4' },
          { icon: 'code', title: 'src/webhooks/stripe.ts', sub: '+28 −2 · 2 AI annotations', badge: '9.1' },
          { icon: 'code', title: 'tests/payment.test.ts', sub: '+44 −0 · critical flag', badge: '⚠' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['Jump to issue', 'Auto-fix', 'Approve', 'Request Changes'] },
      ],
    },
    {
      id: 'review-feed',
      label: 'Live Feed',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today', value: '32' },
          { label: 'Reviews', value: '18' },
          { label: 'AI Flags', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'sarah.kim approved #283', sub: 'just now · race condition fix merged', badge: '✓' },
          { icon: 'star', title: 'AI flagged critical in #284', sub: '3m · API key in test fixtures', badge: '◈' },
          { icon: 'alert', title: 'r.cohen requested changes #282', sub: '8m · DB pool refactor needs docs', badge: '!' },
          { icon: 'check', title: 'AI auto-approved #280', sub: '45m · score 9.9 — chore: bump deps', badge: '◈' },
          { icon: 'share', title: 'r.cohen merged #278', sub: '2h · fix: websocket cleanup', badge: '⇒' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'AI Events', 'Approvals', 'Merges', 'Flags'] },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'PRs Merged', value: '47' },
          { label: 'Avg Review', value: '3.1h' },
          { label: 'AI Saves', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'sarah.kim', sub: '14 merges · 22 reviews · AI 9.2', badge: '🥇' },
          { icon: 'user', title: 'dev.li', sub: '11 merges · 18 reviews · AI 9.0', badge: '🥈' },
          { icon: 'user', title: 'r.cohen', sub: '9 merges · 14 reviews · AI 8.7', badge: '🥉' },
          { icon: 'user', title: 'ana.t', sub: '7 merges · 11 reviews · AI 8.4', badge: '4' },
          { icon: 'user', title: 'e.santos', sub: '6 merges · 9 reviews · AI 8.1', badge: '5' },
        ]},
        { type: 'progress', items: [
          { label: 'sarah.kim (14 merges)', pct: 100 },
          { label: 'dev.li (11 merges)', pct: 79 },
          { label: 'r.cohen (9 merges)', pct: 64 },
        ]},
      ],
    },
    {
      id: 'integrations',
      label: 'Settings',
      content: [
        { type: 'metric-row', items: [
          { label: 'Repos', value: '3' },
          { label: 'Connected', value: '4' },
          { label: 'AI Model', value: 'GPT4o' },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'GitHub', sub: 'PR webhooks · push events · status checks', badge: '●' },
          { icon: 'message', title: 'Slack', sub: 'Review notifications in #dev-team', badge: '●' },
          { icon: 'layers', title: 'Linear', sub: 'Link PRs to issues automatically', badge: '●' },
          { icon: 'grid', title: 'Jira', sub: 'Sync PR status — not connected', badge: '○' },
          { icon: 'activity', title: 'Datadog', sub: 'Deploy impact tracking — not connected', badge: '○' },
        ]},
        { type: 'text', label: '◈ AI Configuration', value: 'Model: GPT-4o · Auto-approve threshold: 9.5\nSecurity scan: ON · Style lint: ON\nTest coverage required: OFF' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',     label: 'Home',    icon: 'home' },
    { id: 'pr-queue',      label: 'PRs',     icon: 'code' },
    { id: 'review-feed',   label: 'Reviews', icon: 'eye' },
    { id: 'team',          label: 'Team',    icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pull-mock', 'PULL — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/pull-mock');
