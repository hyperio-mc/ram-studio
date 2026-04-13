import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CRAG',
  tagline:   'Every endpoint, every second',
  archetype: 'developer-tools',

  palette: {        // dark — Carbon OLED
    bg:      '#000000',
    surface: '#0D0D0D',
    text:    '#EDEDED',
    accent:  '#22D3EE',
    accent2: '#4ADE80',
    muted:   'rgba(107,114,128,0.9)',
  },
  lightPalette: {   // light — clean slate
    bg:      '#F8FAFC',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#16A34A',
    muted:   'rgba(15,23,42,0.45)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Health Score', value: '97.4%', sub: 'Global uptime — all regions' },
        { type: 'metric-row', items: [
          { label: 'Endpoints', value: '48' },
          { label: 'Incidents', value: '2' },
          { label: 'Avg P50', value: '83ms' },
        ]},
        { type: 'progress', items: [
          { label: 'Healthy endpoints', pct: 94 },
          { label: 'Degraded', pct: 4 },
          { label: 'Down', pct: 2 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '/api/v2/auth',     sub: '28ms · 100% uptime',  badge: 'UP' },
          { icon: 'check', title: '/api/v2/users',    sub: '42ms · 99.9% uptime', badge: 'UP' },
          { icon: 'alert', title: '/api/v2/search',   sub: '198ms · 98.1% uptime', badge: 'WARN' },
          { icon: 'zap',   title: '/api/v2/webhooks', sub: '— · 0% uptime',       badge: 'DOWN' },
        ]},
      ],
    },
    {
      id: 'endpoints', label: 'Endpoints',
      content: [
        { type: 'metric-row', items: [
          { label: 'UP', value: '45' },
          { label: 'WARN', value: '2' },
          { label: 'DOWN', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: '/api/v2/auth',      sub: 'GET · 28ms · p99: 94ms',   badge: '100%' },
          { icon: 'activity', title: '/api/v2/users',     sub: 'GET · 42ms · p99: 128ms',  badge: '99.9%' },
          { icon: 'activity', title: '/api/v2/payments',  sub: 'POST · 71ms · p99: 210ms', badge: '99.7%' },
          { icon: 'alert',    title: '/api/v2/search',    sub: 'GET · 198ms · p99: 620ms', badge: 'WARN' },
          { icon: 'activity', title: '/api/v2/files',     sub: 'POST · 55ms · p99: 180ms', badge: '99.5%' },
          { icon: 'zap',      title: '/api/v2/webhooks',  sub: 'POST · — · p99: —',        badge: 'DOWN' },
        ]},
        { type: 'tags', label: 'Method', items: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      ],
    },
    {
      id: 'latency', label: 'Latency',
      content: [
        { type: 'text', label: '/api/v2/search · Degraded', value: 'This endpoint has elevated latency over the past 24 hours. P99 has exceeded 500ms threshold 18 times, triggering 2 alert notifications.' },
        { type: 'metric-row', items: [
          { label: 'P50', value: '198ms' },
          { label: 'P95', value: '480ms' },
          { label: 'P99', value: '620ms' },
        ]},
        { type: 'progress', items: [
          { label: 'P50 vs threshold (200ms)', pct: 99 },
          { label: 'P95 vs threshold (400ms)', pct: 100 },
          { label: 'P99 vs threshold (500ms)', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '14:23:11 — 1240ms', sub: 'HTTP 504 Gateway Timeout', badge: '504' },
          { icon: 'eye',   title: '14:19:44 — 890ms',  sub: 'HTTP 200 — slow query',   badge: '200' },
          { icon: 'eye',   title: '14:15:02 — 742ms',  sub: 'HTTP 200 — cache miss',   badge: '200' },
          { icon: 'eye',   title: '14:08:31 — 695ms',  sub: 'HTTP 200 — heavy payload', badge: '200' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric', label: 'Active Incident', value: 'INC-0047', sub: '/api/v2/webhooks down · 34 minutes · P1 severity' },
        { type: 'tags', label: 'Severity', items: ['P1 Critical', 'P2 High', 'P3 Medium', 'P4 Low'] },
        { type: 'list', items: [
          { icon: 'zap',      title: 'INC-0046 — Resolved', sub: '/api/v2/search degraded · 2h 14m', badge: 'P2' },
          { icon: 'alert',    title: 'INC-0045 — Resolved', sub: '/api/v2/auth elevated latency · 45m', badge: 'P3' },
          { icon: 'alert',    title: 'INC-0044 — Resolved', sub: '/api/v2/payments timeouts · 18m',  badge: 'P3' },
          { icon: 'zap',      title: 'INC-0043 — Resolved', sub: '/api/v2/files storage outage · 3h 51m', badge: 'P1' },
          { icon: 'check',    title: 'INC-0042 — Resolved', sub: '/api/v2/users 502 errors · 9m',    badge: 'P4' },
        ]},
        { type: 'text', label: 'Mean Time to Resolve', value: '47 minutes average this month — within SLA target of 60 minutes.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '12' },
          { label: 'Paused', value: '3' },
          { label: 'Triggered', value: '5 today' },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'Uptime < 99%',          sub: 'All endpoints · Slack + PagerDuty', badge: 'P1' },
          { icon: 'bell', title: 'Latency spike P95>500ms', sub: '/api/v2/search · Slack',         badge: 'P2' },
          { icon: 'bell', title: 'Error rate > 2%',        sub: 'All endpoints · Email',           badge: 'P2' },
          { icon: 'bell', title: 'TLS cert expiry < 14d',  sub: 'All domains · Email',             badge: 'P3' },
          { icon: 'bell', title: 'DNS resolution fail',    sub: 'All domains · PagerDuty',         badge: 'P1' },
        ]},
        { type: 'tags', label: 'Channels', items: ['Slack', 'Email', 'PagerDuty', 'Webhooks', 'SMS'] },
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'text', label: 'Account', value: 'Riko Nakamura · riko@acme.io · PRO PLAN' },
        { type: 'list', items: [
          { icon: 'user',     title: 'Team members',     sub: '4 people invited', badge: 'PRO' },
          { icon: 'lock',     title: 'API keys',         sub: '3 active keys',   badge: '3' },
          { icon: 'activity', title: 'Check interval',   sub: 'Every 30 seconds', badge: '30s' },
          { icon: 'calendar', title: 'Data retention',   sub: 'Last 90 days',    badge: '90d' },
        ]},
        { type: 'tags', label: 'Integrations', items: ['Slack', 'PagerDuty', 'Datadog', 'Webhooks'] },
        { type: 'text', label: 'Status Page', value: 'Public status page at status.acme.io — updated automatically on any P1 or P2 incident.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'endpoints', label: 'Endpoints', icon: 'activity' },
    { id: 'latency',   label: 'Latency',   icon: 'chart' },
    { id: 'incidents', label: 'Incidents', icon: 'alert' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'crag-mock', 'CRAG — Interactive Mock');
console.log('Mock:', result.status, '→', result.url ?? 'https://ram.zenbin.org/crag-mock');
