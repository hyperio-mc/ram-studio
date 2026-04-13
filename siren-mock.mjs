import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SIREN',
  tagline:   'real-time API incident intelligence',
  archetype: 'developer-infrastructure',
  palette: {
    bg:      '#0C0C0F',
    surface: '#131317',
    text:    '#F0EFE8',
    accent:  '#F59E0B',
    accent2: '#06B6D4',
    muted:   'rgba(240,239,232,0.42)',
  },
  lightPalette: {
    bg:      '#F5F6F8',
    surface: '#FFFFFF',
    text:    '#0F0F14',
    accent:  '#D97706',
    accent2: '#0891B2',
    muted:   'rgba(15,15,20,0.42)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Uptime (30d)', value: '99.97%', sub: '3 incidents · all regions' },
        { type: 'metric-row', items: [
          { label: 'Active Incidents', value: '2' },
          { label: 'Error Rate', value: '0.42%' },
          { label: 'P99 Latency', value: '142ms' },
        ]},
        { type: 'progress', items: [
          { label: '/api/auth', pct: 24 },
          { label: '/api/orders', pct: 100 },
          { label: '/api/search', pct: 0 },
          { label: '/api/users', pct: 31 },
        ]},
        { type: 'tags', label: 'Status', items: ['15 Healthy', '2 Degraded', '1 Down'] },
        { type: 'text', label: 'Live Pulse', value: 'P99 latency trending above SLA threshold on orders-service. 2 active incidents under investigation.' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1' },
          { label: 'Warning', value: '1' },
          { label: 'Resolved', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '/api/search returning 503', sub: 'INC-2847 · 14m ago · J.Kim', badge: 'CRIT' },
          { icon: 'zap',   title: 'P99 latency above SLA', sub: 'INC-2846 · 2h ago · R.Patel', badge: 'WARN' },
          { icon: 'check', title: 'Auth service elevated errors', sub: 'INC-2845 · Resolved · M.Torres', badge: 'OK' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Critical', 'Warning', 'Resolved'] },
      ],
    },
    {
      id: 'health',
      label: 'Health',
      content: [
        { type: 'metric-row', items: [
          { label: 'Endpoints', value: '18' },
          { label: 'Healthy', value: '15' },
          { label: 'Degraded', value: '2' },
          { label: 'Down', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: '/api/auth',      sub: '48ms · 99.99%',  badge: 'OK' },
          { icon: 'check',    title: '/api/users',     sub: '61ms · 99.97%',  badge: 'OK' },
          { icon: 'activity', title: '/api/orders',    sub: '312ms · 99.88%', badge: 'WARN' },
          { icon: 'alert',    title: '/api/search',    sub: 'TIMEOUT · 85.2%',badge: 'DOWN' },
          { icon: 'check',    title: '/api/checkout',  sub: '144ms · 99.91%', badge: 'OK' },
          { icon: 'check',    title: '/api/recommend', sub: '63ms · 99.96%',  badge: 'OK' },
        ]},
        { type: 'text', label: 'SLA Threshold', value: 'P99 ≤ 200ms · Availability ≥ 99.9% · Error rate < 1%' },
      ],
    },
    {
      id: 'incident',
      label: 'INC-2847',
      content: [
        { type: 'metric', label: 'Incident Duration', value: '14m', sub: 'CRITICAL · ongoing · /api/search' },
        { type: 'metric-row', items: [
          { label: 'Error Rate', value: '100%' },
          { label: 'Req/min', value: '2.1K' },
          { label: 'Regions', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: '14:26 — Alert triggered', sub: 'Error rate > 50% across all regions', badge: '!' },
          { icon: 'bell',     title: '14:27 — J.Kim paged',    sub: 'Auto-escalated via PagerDuty',        badge: '→' },
          { icon: 'check',    title: '14:29 — Acknowledged',   sub: 'J.Kim acknowledged the incident',     badge: '✓' },
          { icon: 'search',   title: '14:31 — Root cause found',sub: 'search-pod-3 OOMKilled',             badge: '◎' },
          { icon: 'activity', title: '14:38 — Traffic rerouted',sub: 'Shifted to backup cluster',          badge: '⟳' },
        ]},
        { type: 'text', label: 'Next Action', value: 'Investigating memory leak in search-pod. Backup cluster handling 60% of traffic. ETA to resolve: 20m.' },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric', label: 'Primary On-Call', value: 'J.Kim', sub: 'Backend SRE · UTC+09:00 · 22h remaining' },
        { type: 'list', items: [
          { icon: 'user',  title: 'Ji-young Kim',  sub: 'Backend SRE · Sun–Mon',  badge: 'NOW' },
          { icon: 'user',  title: 'Raj Patel',     sub: 'Platform Eng · Tue–Wed', badge: 'NEXT' },
          { icon: 'user',  title: 'Marco Torres',  sub: 'Infra SRE · Thu–Fri',    badge: '2 open' },
          { icon: 'user',  title: 'Amira Osei',    sub: 'Backend SRE · Sat',      badge: 'OK' },
        ]},
        { type: 'metric-row', items: [
          { label: 'MTTR This Week', value: '18m' },
          { label: 'Total Incidents', value: '7' },
          { label: 'Resolved', value: '5' },
        ]},
      ],
    },
    {
      id: 'config',
      label: 'Config',
      content: [
        { type: 'text', label: 'Version', value: 'SIREN v2.4.1 · API Key: srn_live_••••••4a2f' },
        { type: 'tags', label: 'Alerting Rules', items: ['Error > 1%', 'P99 > 200ms', 'Escalate 5m'] },
        { type: 'list', items: [
          { icon: 'bell',     title: 'PagerDuty',       sub: 'Connected · escalation enabled', badge: 'ON' },
          { icon: 'message',  title: 'Slack #incidents', sub: 'Connected · all severities',    badge: 'ON' },
          { icon: 'eye',      title: 'Datadog metrics',  sub: 'Active · 60s resolution',       badge: 'ON' },
          { icon: 'code',     title: 'GitHub deploys',   sub: 'Active · auto-correlate',       badge: 'ON' },
          { icon: 'alert',    title: 'Sentry errors',    sub: 'Inactive · click to connect',   badge: 'OFF' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Rules', value: '12' },
          { label: 'Channels', value: '3' },
          { label: 'Integrations', value: '4' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
    { id: 'health',    label: 'Health',    icon: 'activity' },
    { id: 'team',      label: 'Team',      icon: 'user' },
    { id: 'config',    label: 'Config',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'siren-mock', 'SIREN — Interactive Mock');
console.log('Mock live at:', result.url);
