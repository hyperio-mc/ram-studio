import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DRIP',
  tagline:   'Developer Release Intelligence Platform',
  archetype: 'devops-monitoring',
  palette: {
    bg:      '#0E0F11',
    surface: '#171921',
    text:    '#F0F2F8',
    accent:  '#5E6AD2',
    accent2: '#6EE7B7',
    muted:   'rgba(75,81,104,0.6)',
  },
  lightPalette: {
    bg:      '#F4F5F8',
    surface: '#FFFFFF',
    text:    '#1A1C2A',
    accent:  '#4A56C1',
    accent2: '#059669',
    muted:   'rgba(26,28,42,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '3' },
          { label: 'Success', value: '47' },
          { label: 'Failed', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'api-gateway', sub: 'main → prod · 2m 14s', badge: '✓' },
          { icon: 'zap',      title: 'web-app',     sub: 'feat/auth → staging · running', badge: '▶' },
          { icon: 'alert',    title: 'ml-pipeline',  sub: 'fix/model → dev · failed', badge: '✗' },
          { icon: 'layers',   title: 'data-sync',   sub: 'main → prod · queued', badge: '…' },
          { icon: 'check',    title: 'notifications', sub: 'main → prod · 1m 05s', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'build',
      label: 'Build Detail',
      content: [
        { type: 'metric', label: 'web-app #1,284', value: 'Running', sub: 'feat/auth → staging · 92s elapsed' },
        { type: 'progress', items: [
          { label: 'checkout', pct: 100 },
          { label: 'install', pct: 100 },
          { label: 'lint & typecheck', pct: 100 },
          { label: 'test (unit)', pct: 100 },
          { label: 'test (e2e)', pct: 62 },
          { label: 'build', pct: 0 },
          { label: 'docker push', pct: 0 },
          { label: 'deploy staging', pct: 0 },
        ]},
        { type: 'text', label: 'Current Stage', value: 'Running e2e tests against staging DB. 62 of 98 specs passed.' },
      ],
    },
    {
      id: 'deploys',
      label: 'Deployments',
      content: [
        { type: 'tags', label: 'Environment', items: ['All', 'Production', 'Staging', 'Dev'] },
        { type: 'list', items: [
          { icon: 'check',    title: 'api-gateway v2.14.1', sub: 'prod · 3 min ago · CI/CD', badge: '✓' },
          { icon: 'check',    title: 'web-app v4.8.0',       sub: 'prod · 2 hr ago · jsmith', badge: '✓' },
          { icon: 'alert',    title: 'auth-service v2.1.3',  sub: 'prod · 4 hr ago · CI/CD', badge: '⚠' },
          { icon: 'alert',    title: 'ml-pipeline v1.2.0',   sub: 'prod · yesterday · mkumar', badge: '✗' },
          { icon: 'check',    title: 'notifications v3.0.1', sub: 'prod · yesterday · CI/CD', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Build', value: '1m 52s' },
          { label: 'Success Rate', value: '94.2%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Deploys / Week', value: '183' },
          { label: 'MTTR', value: '8m 14s' },
        ]},
        { type: 'progress', items: [
          { label: 'web-app (64 runs)', pct: 97 },
          { label: 'api-gateway (51 runs)', pct: 100 },
          { label: 'auth-service (38 runs)', pct: 92 },
          { label: 'data-sync (22 runs)', pct: 86 },
        ]},
        { type: 'tags', label: 'Period', items: ['7d', '30d', '90d', 'All'] },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric', label: 'Team Activity', value: '5 members', sub: '2 active now' },
        { type: 'list', items: [
          { icon: 'user', title: 'rsk', sub: 'deployed api-gateway · 3m ago', badge: '●' },
          { icon: 'zap',  title: 'CI/CD', sub: 'web-app build started · 5m ago', badge: '▶' },
          { icon: 'user', title: 'mkumar', sub: 'ml-pipeline build failed · 12m ago', badge: '✗' },
          { icon: 'user', title: 'jlee', sub: 'opened PR: feat/auth · 1h ago', badge: '↑' },
          { icon: 'user', title: 'apark', sub: 'added AWS integration · 2h ago', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      content: [
        { type: 'metric', label: 'Connected Services', value: '6 active', sub: '2 available to add' },
        { type: 'list', items: [
          { icon: 'code',   title: 'GitHub', sub: 'Source control · 4 repos', badge: '✓' },
          { icon: 'layers', title: 'AWS ECR', sub: 'Container registry', badge: '✓' },
          { icon: 'grid',   title: 'Kubernetes', sub: '3 clusters', badge: '✓' },
          { icon: 'message', title: 'Slack', sub: 'Notifications · #deploys', badge: '✓' },
          { icon: 'eye',    title: 'Datadog', sub: 'Monitoring & APM', badge: '✓' },
          { icon: 'bell',   title: 'PagerDuty', sub: 'Incident management', badge: '✓' },
          { icon: 'map',    title: 'Terraform', sub: 'Infrastructure as code', badge: '+' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Pipelines',   icon: 'activity' },
    { id: 'deploys',      label: 'Deploys',      icon: 'layers' },
    { id: 'metrics',      label: 'Metrics',      icon: 'chart' },
    { id: 'team',         label: 'Team',         icon: 'user' },
    { id: 'integrations', label: 'Settings',     icon: 'settings' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'drip');
const result = await publishMock(built, 'drip');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/drip-mock`);
