// ZEAL — Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ZEAL',
  tagline:   'Database branch intelligence',
  archetype: 'developer-tool',

  // DARK theme (primary)
  palette: {
    bg:      '#080C14',
    surface: '#0F1422',
    text:    '#DCE5F7',
    accent:  '#3DFFC0',
    accent2: '#9B7BFF',
    muted:   'rgba(220,229,247,0.40)',
  },

  // LIGHT theme
  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0A0E1A',
    accent:  '#00C97A',
    accent2: '#7B4FEF',
    muted:   'rgba(10,14,26,0.45)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'p99 Latency', value: '18ms', sub: '↓ 4ms vs last hour' },
        { type: 'metric-row', items: [
          { label: 'QPS', value: '4.2K' },
          { label: 'p50', value: '3ms' },
          { label: 'Errors', value: '0.02%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'main', sub: 'p99: 18ms · 4.2K QPS · healthy', badge: '●' },
          { icon: 'check', title: 'dev/feature-auth', sub: 'p99: 22ms · 0.8K QPS · healthy', badge: '●' },
          { icon: 'alert', title: 'staging', sub: 'p99: 84ms · 1.1K QPS · degraded', badge: '⚠' },
          { icon: 'check', title: 'preview/pr-412', sub: 'p99: 15ms · 0.2K QPS · healthy', badge: '●' },
        ]},
        { type: 'progress', items: [
          { label: 'Connection pool', pct: 68 },
          { label: 'Query budget (hourly)', pct: 42 },
          { label: 'Storage utilization', pct: 31 },
        ]},
      ],
    },
    {
      id: 'branches',
      label: 'Branches',
      content: [
        { type: 'metric-row', items: [
          { label: 'Branches', value: '4' },
          { label: 'Healthy', value: '3' },
          { label: 'Degraded', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'main', sub: 'a3f9d21 · 2h ago · 4.2K QPS', badge: '●' },
          { icon: 'layers', title: 'dev/feature-auth', sub: 'c91bb44 · 5h ago · 0.8K QPS', badge: '●' },
          { icon: 'alert', title: 'staging', sub: '7d3a10e · 1d ago · latency spike', badge: '⚠' },
          { icon: 'layers', title: 'preview/pr-412', sub: 'f023c88 · 3h ago · 0.2K QPS', badge: '●' },
        ]},
        { type: 'tags', label: 'Branch operations', items: ['Create branch', 'Compare branches', 'Merge check', 'Delete stale'] },
      ],
    },
    {
      id: 'queries',
      label: 'Queries',
      content: [
        { type: 'metric', label: 'Slowest Query', value: '312ms', sub: 'JOIN on users × plans — 84K rows' },
        { type: 'list', items: [
          { icon: 'zap', title: 'users JOIN plans', sub: '312ms · 84K rows · SELECT', badge: '!' },
          { icon: 'zap', title: 'analytics_events UPDATE', sub: '214ms · 52K rows · UPDATE', badge: '!' },
          { icon: 'zap', title: 'audit_log COUNT', sub: '189ms · 203K rows · COUNT', badge: '!' },
          { icon: 'activity', title: 'job_queue INSERT', sub: '97ms · 12K rows · INSERT', badge: '' },
          { icon: 'activity', title: 'sessions SELECT DISTINCT', sub: '68ms · 31K rows · SELECT', badge: '' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', '> 50ms', '> 100ms', 'Errors'] },
      ],
    },
    {
      id: 'connections',
      label: 'Connect',
      content: [
        { type: 'metric', label: 'Active Connections', value: '68/100', sub: 'pgbouncer · us-east-1' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '68' },
          { label: 'Idle', value: '21' },
          { label: 'Waiting', value: '11' },
        ]},
        { type: 'progress', items: [
          { label: 'Connection utilization', pct: 68 },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'app-prod-01', sub: 'pgbouncer · 28 connections', badge: '●' },
          { icon: 'code', title: 'worker-fleet', sub: 'pgbouncer · 22 connections', badge: '●' },
          { icon: 'code', title: 'analytics-svc', sub: 'direct · 12 connections', badge: '●' },
          { icon: 'code', title: 'cron-runner', sub: 'pgbouncer · 6 connections', badge: '' },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Firing', value: '1' },
          { label: 'Pending', value: '2' },
          { label: 'Resolved', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'High Latency — staging', sub: 'p99 > 80ms · firing 14 min', badge: '🔴' },
          { icon: 'bell', title: 'Connection Spike', sub: 'conns > 85% capacity · pending', badge: '🟡' },
          { icon: 'bell', title: 'Error Rate Rise', sub: 'errors > 0.5% / 3min · pending', badge: '🟡' },
        ]},
        { type: 'progress', items: [
          { label: 'Error budget remaining', pct: 94 },
          { label: 'SLO compliance this month', pct: 99 },
        ]},
        { type: 'tags', label: 'Alert rules active', items: ['Latency SLO', 'Connection Limit', 'Error Budget'] },
      ],
    },
  ],

  nav: [
    { id: 'overview',     label: 'Overview',  icon: 'home' },
    { id: 'branches',     label: 'Branches',  icon: 'layers' },
    { id: 'queries',      label: 'Queries',   icon: 'zap' },
    { id: 'connections',  label: 'Connect',   icon: 'activity' },
    { id: 'alerts',       label: 'Alerts',    icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'zeal-db-mock', 'ZEAL — Interactive Mock');
console.log('Mock live at:', result.url);
