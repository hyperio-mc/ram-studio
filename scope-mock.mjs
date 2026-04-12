import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SCOPE',
  tagline:   "observability that doesn't blink",
  archetype: 'devops-observability',
  palette: {
    bg:      '#0B0D17',
    surface: '#111520',
    text:    '#F5F7FF',
    accent:  '#FF6B35',
    accent2: '#22D3EE',
    muted:   'rgba(245,247,255,0.40)',
  },
  lightPalette: {
    bg:      '#F8F9FC',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#E05A28',
    accent2: '#0891B2',
    muted:   'rgba(15,23,42,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '99.98%' },
          { label: 'Latency', value: '42ms' },
          { label: 'Req/hr', value: '1.2M' },
          { label: 'Error Rate', value: '0.03%' },
        ]},
        { type: 'metric', label: 'System Health', value: '8/9', sub: 'services healthy · 1 warning' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Cache Cluster', sub: 'Memory > 90% — WARN', badge: 'P2' },
          { icon: 'check', title: 'API Gateway', sub: 'All systems nominal', badge: 'OK' },
          { icon: 'check', title: 'Auth Service', sub: 'All systems nominal', badge: 'OK' },
        ]},
        { type: 'progress', items: [
          { label: 'API Gateway', pct: 100 },
          { label: 'Cache Cluster', pct: 92 },
          { label: 'Search Engine', pct: 78 },
        ]},
        { type: 'tags', label: 'Active Monitors', items: ['PostgreSQL', 'Redis', 'API', 'Queue', 'Search', 'Notify'] },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '3', sub: '1 critical · 2 warning' },
        { type: 'list', items: [
          { icon: 'alert', title: 'DB Replication Lag', sub: 'PostgreSQL · 8.4s lag · P1', badge: 'CRIT' },
          { icon: 'alert', title: 'Cache Memory > 90%', sub: 'Redis Cluster · 14.8GB/16GB', badge: 'P2' },
          { icon: 'alert', title: 'High 503 Rate', sub: 'API Gateway · /v2/search · 2.1%', badge: 'P2' },
          { icon: 'bell', title: 'Certificate Expiry', sub: 'Load Balancer · 14 days left', badge: 'P3' },
        ]},
        { type: 'tags', label: 'Severity', items: ['P1 Critical', 'P2 Warning', 'P3 Info', 'All Resolved'] },
        { type: 'text', label: 'On-Call', value: 'Sarah Kim (SRE Lead) is currently on-call. 2 responders acknowledged INC-0047.' },
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'Healthy', value: '8' },
          { label: 'Degraded', value: '2' },
          { label: 'Down', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'API Gateway', sub: 'v3.12.1 · 42ms · 0.02% errors', badge: 'OK' },
          { icon: 'check', title: 'Auth Service', sub: 'v2.8.0 · 28ms · 0.00% errors', badge: 'OK' },
          { icon: 'alert', title: 'Cache Cluster', sub: 'v7.0.15 · 3ms · Memory WARN', badge: 'WARN' },
          { icon: 'alert', title: 'Search Engine', sub: 'v8.12.0 · 156ms · 2.10% errors', badge: 'WARN' },
          { icon: 'zap', title: 'Notification Svc', sub: 'v1.9.2 · Connection refused', badge: 'DOWN' },
        ]},
        { type: 'progress', items: [
          { label: 'API Gateway', pct: 100 },
          { label: 'Auth Service', pct: 100 },
          { label: 'Cache Cluster', pct: 91 },
          { label: 'Search Engine', pct: 78 },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'metric-row', items: [
          { label: 'Events/min', value: '2,841' },
          { label: 'Errors', value: '12' },
          { label: 'Warnings', value: '34' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'ERR postgres', sub: 'replication_lag exceeded: 8437ms', badge: 'ERR' },
          { icon: 'alert', title: 'WARN redis', sub: 'memory_used: 14.8GB / 16GB (92.5%)', badge: 'WARN' },
          { icon: 'activity', title: 'INFO api', sub: 'GET /v2/search 200 42ms mobile', badge: 'OK' },
          { icon: 'alert', title: 'ERR api', sub: 'GET /v2/search 503 timeout upstream', badge: 'ERR' },
          { icon: 'activity', title: 'INFO auth', sub: 'user_login uid=82741 oauth2', badge: 'OK' },
        ]},
        { type: 'tags', label: 'Filter', items: ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] },
        { type: 'text', label: 'Live Stream', value: 'Streaming 2,841 events/min across 9 services. Filter by severity, service, or trace ID.' },
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric', label: 'INC-0047 Active', value: '12min', sub: 'DB replication lag > 8s · P1 · 2 responders' },
        { type: 'list', items: [
          { icon: 'alert', title: 'DETECTED 09:41', sub: 'Automated via PagerDuty rule', badge: 'P1' },
          { icon: 'bell', title: 'ALERT 09:38', sub: 'P1 fired — replication_lag > 2s', badge: 'P1' },
          { icon: 'code', title: 'DEPLOY 09:35', sub: 'postgres-15.2 config patch', badge: 'WARN' },
          { icon: 'activity', title: 'METRICS 09:29', sub: 'Lag crossed 500ms warning', badge: 'INFO' },
          { icon: 'check', title: 'RESOLVED 08:52', sub: 'INC-0046 closed · 34min MTTR', badge: 'OK' },
        ]},
        { type: 'metric-row', items: [
          { label: 'MTTR (30d)', value: '28min' },
          { label: 'Incidents', value: '47' },
          { label: 'MTTD', value: '4min' },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Sarah Kim', value: 'ON-CALL', sub: 'SRE Lead · Acme Corp' },
        { type: 'list', items: [
          { icon: 'bell', title: 'P1 Alerts', sub: 'Immediate — call + SMS', badge: 'ON' },
          { icon: 'bell', title: 'P2 Alerts', sub: 'Within 5 minutes', badge: 'ON' },
          { icon: 'bell', title: 'P3 Alerts', sub: 'Batched hourly digest', badge: 'OFF' },
          { icon: 'star', title: 'Weekly Report', sub: 'Monday 9AM summary', badge: 'ON' },
        ]},
        { type: 'tags', label: 'Integrations', items: ['PagerDuty ✓', 'Slack ✓', 'Datadog ✓', 'Jira →'] },
        { type: 'text', label: 'Account', value: 'Team: Acme Infrastructure SRE · 12 members · Pro Plan · Renews May 2026' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',      icon: 'home' },
    { id: 'alerts',    label: 'Alerts',    icon: 'alert' },
    { id: 'services',  label: 'Services',  icon: 'layers' },
    { id: 'logs',      label: 'Logs',      icon: 'activity' },
    { id: 'incidents', label: 'Incidents', icon: 'zap' },
    { id: 'settings',  label: 'Settings',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'scope2-mock', 'SCOPE — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/scope2-mock');
