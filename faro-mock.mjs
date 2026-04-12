/**
 * FARO — Svelte Interactive Mock
 * RAM Design Heartbeat — 2026-03-29
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FARO',
  tagline:   'Developer Log Intelligence Platform',
  archetype: 'observability-dark',
  palette: {
    bg:      '#07090F',
    surface: '#111624',
    text:    '#C8D4E8',
    accent:  '#00C7BE',
    accent2: '#6B5FEB',
    muted:   'rgba(200,212,232,0.35)',
  },
  lightPalette: {
    bg:      '#F0F4FA',
    surface: '#FFFFFF',
    text:    '#0F1824',
    accent:  '#0099A3',
    accent2: '#5B4FD6',
    muted:   'rgba(15,24,36,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Uptime (30d)', value: '99.98%', sub: 'All systems healthy' },
        { type: 'metric-row', items: [
          { label: 'Error Rate', value: '0.14%' },
          { label: 'P95 Latency', value: '84ms' },
          { label: 'Events/day', value: '1.2M' },
        ]},
        { type: 'text', label: 'Log Volume', value: 'Hourly volume chart shows a spike at 09:38 UTC — correlates with DB pool exhaustion.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'DB Connection Pool Exhausted', sub: 'api-gateway · 1 min ago', badge: 'P0' },
          { icon: 'alert', title: 'Worker Queue Depth Threshold', sub: 'worker-3 · 3 min ago',   badge: 'P1' },
          { icon: 'check', title: 'JWT Key Rotation Completed',   sub: 'auth-svc · 5 min ago',   badge: 'OK' },
          { icon: 'check', title: 'CDN Cache Warmed 98.3%',       sub: 'cdn · 7 min ago',         badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'tags', label: 'Severity Filter', items: ['All', 'ERROR', 'WARN', 'INFO', 'DEBUG'] },
        { type: 'list', items: [
          { icon: 'alert', title: '[pg-pool] ECONNREFUSED 5432',           sub: '09:41:32 · api-gateway · ERROR', badge: 'ERR' },
          { icon: 'alert', title: '[pg-pool] retry 3/5 failed',            sub: '09:41:31 · api-gateway · ERROR', badge: 'ERR' },
          { icon: 'alert', title: 'queue.depth=5242 > warn_threshold',     sub: '09:41:29 · worker-3 · WARN',     badge: 'WRN' },
          { icon: 'check', title: 'jwt.rotation: 12048 keys cycled ok',    sub: '09:41:28 · auth-svc · INFO',     badge: 'INF' },
          { icon: 'check', title: 'cache.warm: hit_rate=0.983',            sub: '09:41:27 · cdn · INFO',          badge: 'INF' },
          { icon: 'star',  title: 'cron: next_run=09:42:00 job=cleanup',   sub: '09:41:26 · scheduler · DEBUG',   badge: 'DBG' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open',   value: '2' },
          { label: 'Ack\'d', value: '5' },
          { label: 'Closed', value: '18' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'DB Connection Pool Exhausted',  sub: 'api-gateway · 3 min · Dan K.',    badge: 'P0' },
          { icon: 'alert', title: 'Worker Queue Depth Threshold',  sub: 'worker-3 · 5 min · Priya S.',     badge: 'P1' },
          { icon: 'eye',   title: 'SMTP Retry Rate Elevated',       sub: 'mailer · 11 min · Unassigned',    badge: 'P2' },
          { icon: 'check', title: 'High CPU on worker-1',           sub: 'Resolved 38 min ago',             badge: 'RES' },
          { icon: 'check', title: 'CDN origin timeout spike',       sub: 'Resolved 2h ago',                 badge: 'RES' },
        ]},
        { type: 'text', label: 'Tip', value: 'P0 alerts auto-escalate to on-call in 5 minutes.' },
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric-row', items: [
          { label: 'Connected', value: '8' },
          { label: 'Healthy',   value: '7' },
          { label: 'Degraded',  value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Kubernetes',     sub: 'prod-us-east · 440k/day',  badge: '●' },
          { icon: 'check', title: 'AWS Lambda',     sub: 'us-east-1 · 290k/day',     badge: '●' },
          { icon: 'check', title: 'Vercel',         sub: 'edge — global · 180k/day', badge: '●' },
          { icon: 'alert', title: 'Fly.io',         sub: 'sjc/ams/sin · 140k/day',   badge: '⚠' },
          { icon: 'check', title: 'Supabase',       sub: 'prod db · 95k/day',        badge: '●' },
          { icon: 'check', title: 'GitHub Actions', sub: 'ci/cd · 60k/day',          badge: '●' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: '◈ AI Pattern Detected', value: 'DB pool exhaustion correlates with a 3× spike in /v2/events write traffic triggered 09:38 — 3 services impacted. Recommendation: scale pg-pool max_conn ≥ 120.' },
        { type: 'progress', items: [
          { label: 'api-gateway (97% conf)',   pct: 97 },
          { label: 'postgres write (88% conf)', pct: 88 },
          { label: 'cdn edge (74% conf)',       pct: 74 },
          { label: 'redis cluster (71% conf)',  pct: 71 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'Error rate spike +840%',      sub: '09:38 · api-gateway',    badge: '97%' },
          { icon: 'activity', title: 'Write QPS anomaly +310%',   sub: '09:37 · postgres write', badge: '88%' },
          { icon: 'eye',    title: 'Latency drift detected',       sub: '09:21 · cdn edge',       badge: '74%' },
          { icon: 'chart',  title: 'Cache efficiency drop',        sub: '08:55 · redis cluster',  badge: '71%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'logs',     label: 'Logs',     icon: 'list' },
    { id: 'alerts',   label: 'Alerts',   icon: 'zap' },
    { id: 'sources',  label: 'Sources',  icon: 'grid' },
    { id: 'insights', label: 'Insights', icon: 'eye' },
  ],
};

console.log('Building Svelte component…');
const svelteSource = generateSvelteComponent(design);

console.log('Compiling to HTML…');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'faro-mock',
});

console.log('Publishing mock…');
const result = await publishMock(html, 'faro-mock', 'FARO — Interactive Mock');
console.log('Mock live at:', result.url || result);
