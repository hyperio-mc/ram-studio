import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WATCH',
  tagline:   'Your stack, always on.',
  archetype: 'dev-monitoring',
  palette: {
    bg:      '#070709',
    surface: '#0D0E12',
    text:    '#E8E9F3',
    accent:  '#00FFB0',
    accent2: '#6366F1',
    muted:   'rgba(136,140,168,0.5)',
  },
  lightPalette: {
    bg:      '#F2F4FF',
    surface: '#FFFFFF',
    text:    '#0D0F1A',
    accent:  '#059669',
    accent2: '#6366F1',
    muted:   'rgba(91,95,128,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'System Health', value: '99.8%', sub: 'All services monitored' },
        { type: 'metric-row', items: [
          { label: 'Services', value: '16' },
          { label: 'Incidents', value: '4' },
          { label: 'P95 Resp', value: '64ms' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'API Gateway', sub: 'us-east-1 · 42ms', badge: '99.98%' },
          { icon: 'check', title: 'Auth Service', sub: 'global · 18ms',   badge: '100.0%' },
          { icon: 'alert', title: 'DB Cluster',  sub: 'us-west-2 · 187ms', badge: '99.12%' },
          { icon: 'check', title: 'CDN Edge',    sub: 'global · 8ms',    badge: '99.99%' },
        ]},
        { type: 'progress', items: [
          { label: '90-Day Avg Uptime', pct: 99 },
          { label: 'SLA Target',        pct: 99.5 },
        ]},
        { type: 'text', label: 'Active Incident', value: 'INC-0291 · Queue Worker · 2h 14m ongoing' },
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Operational', 'Degraded', 'Outage'] },
        { type: 'list', items: [
          { icon: 'check',  title: 'API Gateway',      sub: '99.98% · us-east-1',  badge: 'OK' },
          { icon: 'check',  title: 'Auth Service',     sub: '100.0% · global',     badge: 'OK' },
          { icon: 'alert',  title: 'DB Cluster',       sub: '99.12% · us-west-2',  badge: 'Degraded' },
          { icon: 'check',  title: 'CDN Edge',         sub: '99.99% · global',     badge: 'OK' },
          { icon: 'check',  title: 'Webhooks',         sub: '99.87% · eu-west-1',  badge: 'OK' },
          { icon: 'zap',    title: 'Queue Worker',     sub: '97.43% · us-east-1',  badge: 'Outage' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open', value: '4' },
          { label: 'This Week', value: '7' },
          { label: 'Resolved', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'INC-0291 · Queue Worker',   sub: '2h 14m · Today 08:42',  badge: 'OPEN' },
          { icon: 'alert',  title: 'INC-0290 · DB Cluster',     sub: '43m · Today 11:20',     badge: 'OPEN' },
          { icon: 'check',  title: 'INC-0289 · Queue Worker',   sub: '18m · Yesterday',       badge: 'DONE' },
          { icon: 'check',  title: 'INC-0288 · API Gateway',    sub: '5m · Mar 30',           badge: 'DONE' },
        ]},
        { type: 'text', label: 'MTTA', value: '3m 24s mean time to acknowledge across all open incidents' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Rules', value: '4' },
          { label: 'Paused', value: '2' },
          { label: 'Channels', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',  title: 'p99 Latency > 200ms',  sub: 'API Gateway · PagerDuty', badge: 'ON' },
          { icon: 'bell',  title: 'Error rate > 1%',      sub: 'All services · Slack',    badge: 'ON' },
          { icon: 'bell',  title: 'Uptime < 99.5%',       sub: 'DB Cluster · Email',      badge: 'ON' },
          { icon: 'bell',  title: 'Queue depth > 10k',    sub: 'Queue Worker · PagerDuty',badge: 'ON' },
          { icon: 'eye',   title: 'CPU spike > 85%',      sub: 'All services · Slack',    badge: 'OFF' },
          { icon: 'eye',   title: 'Memory > 90%',         sub: 'Worker nodes · Email',    badge: 'OFF' },
        ]},
      ],
    },
    {
      id: 'oncall', label: 'On-Call',
      content: [
        { type: 'metric', label: 'On-Call Now', value: 'Sofia Lin', sub: 'Senior SRE · Until Apr 2, 09:00' },
        { type: 'list', items: [
          { icon: 'user',  title: 'Sofia Lin',   sub: 'Today → Apr 2 · Primary',  badge: 'NOW' },
          { icon: 'user',  title: 'Marcus Oto',  sub: 'Apr 2 → Apr 4 · Primary',  badge: 'NEXT' },
          { icon: 'user',  title: 'Priya Nair',  sub: 'Apr 4 → Apr 6 · Primary',  badge: 'SCHED' },
          { icon: 'user',  title: 'James Wei',   sub: 'Apr 6 → Apr 8 · Backup',   badge: 'SCHED' },
        ]},
        { type: 'metric-row', items: [
          { label: 'MTTA', value: '3m 24s' },
          { label: 'MTTR', value: '47m' },
          { label: 'ACK%', value: '98.2%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'activity' },
    { id: 'services',  label: 'Services',  icon: 'layers'   },
    { id: 'incidents', label: 'Incidents', icon: 'zap'      },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell'     },
    { id: 'oncall',    label: 'On-Call',   icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'watch-mock', 'WATCH — Interactive Mock');
console.log('Mock live at:', result.url);
