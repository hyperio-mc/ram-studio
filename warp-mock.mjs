import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WARP',
  tagline:   'Release velocity for engineering teams',
  archetype: 'devops-dashboard',
  palette: {
    bg:      '#0B0C10',
    surface: '#13151C',
    text:    '#E2E8F0',
    accent:  '#6366F1',
    accent2: '#F59E0B',
    muted:   'rgba(100,116,139,0.45)',
  },
  lightPalette: {
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#4F46E5',
    accent2: '#D97706',
    muted:   'rgba(15,23,42,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'RELEASE VELOCITY', value: '94', sub: '↑ 12 pts from last sprint' },
        { type: 'metric-row', items: [
          { label: 'DEPLOYS', value: '48' },
          { label: 'SUCCESS', value: '96%' },
          { label: 'MTTR', value: '4m' },
        ]},
        { type: 'text', label: 'Deploy Streak', value: '🔥 18-day deploy streak — longest in Q2' },
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway', sub: 'prod · a7f3c12 · 2m ago', badge: '✓' },
          { icon: 'check', title: 'web-frontend', sub: 'prod · b9d1e45 · 28m ago', badge: '✓' },
          { icon: 'activity', title: 'auth-service', sub: 'staging · c2a8f67 · 1h ago', badge: '→' },
          { icon: 'alert', title: 'data-pipeline', sub: 'prod · failed · 3h ago', badge: '✗' },
        ]},
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Deploys', 'Alerts', 'PRs', 'Reviews'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'api-gateway deployed to prod', sub: 'by @alexk · a7f3c12 · now', badge: '◉' },
          { icon: 'plus', title: 'PR #892 merged: auth refactor', sub: '+247 -89 · 12m ago', badge: '⊕' },
          { icon: 'alert', title: 'Error spike on /checkout', sub: 'p99 latency > 2.4s · 18m', badge: '⚠' },
          { icon: 'star', title: 'PR #890 approved', sub: 'by @saria · web-frontend · 34m', badge: '◈' },
          { icon: 'check', title: 'web-frontend deployed', sub: 'by @mattd · b9d1e45 · 28m', badge: '◉' },
          { icon: 'code', title: 'PR #891 opened: perf cache', sub: 'data-pipeline · @riya · 45m', badge: '⊕' },
        ]},
      ],
    },
    {
      id: 'deploy',
      label: 'Deploy',
      content: [
        { type: 'metric', label: 'LIVE IN PRODUCTION', value: 'v2.14.3', sub: 'api-gateway · us-east-1 · 2m ago' },
        { type: 'progress', items: [
          { label: 'Build', pct: 100 },
          { label: 'Test', pct: 100 },
          { label: 'Security Scan', pct: 100 },
          { label: 'Deploy', pct: 100 },
          { label: 'Health Check', pct: 100 },
        ]},
        { type: 'metric-row', items: [
          { label: 'RESPONSE', value: '87ms' },
          { label: 'ERRORS', value: '0.02%' },
          { label: 'THROUGHPUT', value: '4.2K/s' },
        ]},
        { type: 'text', label: 'Commit', value: 'fix: resolve auth race condition on concurrent token refresh calls — @alexk, 4 files' },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'text', label: 'Sprint Health', value: '72% on track · 18% at risk · 10% blocked' },
        { type: 'progress', items: [
          { label: 'Alex Kim — Backend', pct: 94 },
          { label: 'Saria Patel — Frontend', pct: 88 },
          { label: 'Matt Davis — Platform', pct: 82 },
          { label: 'Priya Singh — Backend', pct: 76 },
          { label: 'Riya Chen — Data', pct: 71 },
        ]},
        { type: 'metric-row', items: [
          { label: 'TOP DEPLOYS', value: '18' },
          { label: 'TOP PRs', value: '12' },
          { label: 'AVG SCORE', value: '82' },
        ]},
      ],
    },
    {
      id: 'changelog',
      label: 'Changelog',
      content: [
        { type: 'tags', label: 'Version type', items: ['All', 'Major', 'Minor', 'Patch'] },
        { type: 'list', items: [
          { icon: 'code', title: 'v2.14.3 — patch', sub: 'Auth race condition fix · Apr 13', badge: 'fix' },
          { icon: 'zap', title: 'v2.14.0 — minor', sub: 'Performance & caching overhaul · Apr 10', badge: 'feat' },
          { icon: 'star', title: 'v2.13.0 — minor', sub: 'Team permissions v2 · Apr 3', badge: 'feat' },
          { icon: 'check', title: 'v2.12.1 — patch', sub: 'Webhook retry fixes · Mar 28', badge: 'fix' },
        ]},
        { type: 'text', label: 'Latest Changes', value: 'fix: concurrent token refresh bug · fix: session expiry edge case · chore: update deps' },
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      content: [
        { type: 'metric-row', items: [
          { label: 'CONNECTED', value: '6' },
          { label: 'AVAILABLE', value: '2' },
          { label: 'HEALTH', value: '100%' },
        ]},
        { type: 'progress', items: [
          { label: 'Active integrations', pct: 75 },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'GitHub', sub: 'Source control & PRs', badge: '●' },
          { icon: 'message', title: 'Slack', sub: 'Deploy notifications', badge: '●' },
          { icon: 'alert', title: 'PagerDuty', sub: 'Incident routing', badge: '●' },
          { icon: 'activity', title: 'Datadog', sub: 'Metrics & traces', badge: '●' },
          { icon: 'layers', title: 'Linear', sub: 'Issue tracking', badge: '●' },
          { icon: 'zap', title: 'Vercel', sub: 'Edge deployments', badge: '●' },
          { icon: 'eye', title: 'Jira', sub: 'Project management · Connect', badge: '○' },
          { icon: 'alert', title: 'Sentry', sub: 'Error monitoring · Connect', badge: '○' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Dash', icon: 'home' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'deploy', label: 'Deploy', icon: 'zap' },
    { id: 'team', label: 'Team', icon: 'user' },
    { id: 'changelog', label: 'Log', icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'warp-mock', 'WARP — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/warp-mock`);
