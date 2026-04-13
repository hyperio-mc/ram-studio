import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'RIFT',
  tagline:   'Engineering health, at a glance.',
  archetype: 'developer-analytics',
  palette: {
    bg:      '#0A0E14',
    surface: '#0F1923',
    text:    '#E8F4F8',
    accent:  '#00D4FF',
    accent2: '#7FFF00',
    muted:   'rgba(123,168,192,0.45)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0D1B2A',
    accent:  '#0090B3',
    accent2: '#4DA600',
    muted:   'rgba(13,27,42,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'DORA SCORE', value: '87', sub: 'Top 15% of engineering teams' },
        { type: 'metric-row', items: [
          { label: 'Deploys/day', value: '4.2' },
          { label: 'Lead Time',   value: '2.8h' },
          { label: 'MTTR',        value: '14m'  },
          { label: 'Change Fail', value: '3.2%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway',   sub: 'prod · 2m ago',  badge: '✓' },
          { icon: 'check', title: 'web-frontend',  sub: 'prod · 14m ago', badge: '✓' },
          { icon: 'alert', title: 'auth-service',  sub: 'staging · 1h ago',badge: '✗' },
          { icon: 'zap',   title: 'data-pipeline', sub: 'prod · 2h ago',  badge: '…' },
        ]},
      ],
    },
    {
      id: 'code-health', label: 'Code Health',
      content: [
        { type: 'text', label: 'OVERALL HEALTH', value: '87% healthy — 13 issues found across 6 repositories' },
        { type: 'progress', items: [
          { label: 'auth-service (A+)',   pct: 93 },
          { label: 'api-gateway (A)',     pct: 84 },
          { label: 'infra-modules (B+)',  pct: 79 },
          { label: 'web-frontend (B)',    pct: 71 },
          { label: 'mobile-client (B-)', pct: 66 },
          { label: 'data-pipeline (C)',   pct: 58 },
        ]},
        { type: 'tags', label: 'TECH DEBT', items: ['Low: 3 repos', 'Medium: 2 repos', 'High: 1 repo'] },
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total (30d)',  value: '12'  },
          { label: 'Open',        value: '2'   },
          { label: 'Avg MTTR',    value: '14m' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'API Gateway 503s',   sub: 'P1 · open · 2h ago',    badge: 'P1' },
          { icon: 'alert', title: 'Auth token expiry',  sub: 'P2 · open · 8h ago',    badge: 'P2' },
          { icon: 'check', title: 'DB connection pool', sub: 'P1 · resolved · 22m MTTR', badge: '✓' },
          { icon: 'check', title: 'Frontend CDN miss',  sub: 'P3 · resolved · 8m MTTR', badge: '✓' },
          { icon: 'check', title: 'Kafka consumer lag', sub: 'P2 · resolved · 41m MTTR', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'velocity', label: 'Velocity',
      content: [
        { type: 'metric', label: 'SPRINT 42 PROGRESS', value: '81%', sub: '34/42 pts · 2 days remaining' },
        { type: 'progress', items: [
          { label: 'Avg Cycle Time', pct: 62 },
          { label: 'Review Lag',     pct: 18 },
          { label: 'PR Merge Rate',  pct: 94 },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'J. Lim',      sub: '8 PRs · 12 pts', badge: '#1' },
          { icon: 'user',   title: 'A. Patel',    sub: '6 PRs · 10 pts', badge: '#2' },
          { icon: 'user',   title: 'M. Osei',     sub: '7 PRs · 9 pts',  badge: '#3' },
          { icon: 'user',   title: 'S. Torres',   sub: '5 PRs · 8 pts',  badge: '#4' },
          { icon: 'user',   title: 'K. Nakamura', sub: '4 PRs · 7 pts',  badge: '#5' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'tags', label: 'SEVERITY', items: ['2 Critical', '4 Warning', '2 Info'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'High CPU on prod-api-02', sub: 'api-gateway · 94% · 3m ago', badge: '!' },
          { icon: 'alert', title: 'Disk usage >85%',          sub: 'postgres · 87% · 12m ago',  badge: '!' },
          { icon: 'bell',  title: 'Slow query detected',      sub: 'postgres · 4.2s · acked',   badge: '~' },
          { icon: 'alert', title: 'Memory pressure spike',    sub: 'auth-service · 91%',        badge: '!' },
          { icon: 'bell',  title: 'Cert expiry in 14 days',   sub: 'infra · acked',             badge: '~' },
          { icon: 'eye',   title: 'P99 latency elevated',     sub: 'data-pipeline · 1.8s',      badge: 'i' },
        ]},
      ],
    },
    {
      id: 'integrations', label: 'Integrations',
      content: [
        { type: 'metric-row', items: [
          { label: 'Healthy',  value: '4' },
          { label: 'Degraded', value: '2' },
          { label: 'Error',    value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'GitHub',    sub: 'Repos, PRs, commits · 1m ago',    badge: '✓' },
          { icon: 'check',    title: 'PagerDuty', sub: 'Incident mgmt · 2m ago',          badge: '✓' },
          { icon: 'check',    title: 'Datadog',   sub: 'Metrics & APM · 1m ago',          badge: '✓' },
          { icon: 'alert',    title: 'Jira',      sub: 'Sprints & velocity · degraded',   badge: '~' },
          { icon: 'check',    title: 'SonarQube', sub: 'Code quality · 5m ago',           badge: '✓' },
          { icon: 'alert',    title: 'ArgoCD',    sub: 'Deploy pipelines · degraded',     badge: '~' },
          { icon: 'alert',    title: 'Slack',     sub: 'Alert notifs · ERROR · 2h ago',   badge: '✗' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'code-health',  label: 'Health', icon: 'activity' },
    { id: 'incidents',    label: 'Incidents', icon: 'alert' },
    { id: 'dashboard',    label: 'Dash', icon: 'grid' },
    { id: 'alerts',       label: 'Alerts', icon: 'bell' },
    { id: 'velocity',     label: 'Team', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'rift-mock', 'RIFT — Interactive Mock');
console.log('Mock live at:', result.url || `https://ram.zenbin.org/rift-mock`);
