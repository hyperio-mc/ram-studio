import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NEXUS',
  tagline:   'Real-time AI agent operations',
  archetype: 'ops-dashboard',
  palette: {
    bg:      '#0B0B0E',
    surface: '#131318',
    text:    '#EEEEF2',
    accent:  '#00E8C8',
    accent2: '#8B72F8',
    muted:   'rgba(238,238,242,0.35)',
  },
  lightPalette: {
    bg:      '#F0F2F5',
    surface: '#FFFFFF',
    text:    '#0D0F14',
    accent:  '#0097A7',
    accent2: '#5C4FC9',
    muted:   'rgba(13,15,20,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Agents', value: '8' },
          { label: 'Queued Tasks', value: '24' },
          { label: 'Errors', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'code-gen-01', sub: 'CODE · 72% · 14m', badge: '●' },
          { icon: 'activity', title: 'test-runner', sub: 'TEST · 89% · 21m', badge: '●' },
          { icon: 'activity', title: 'doc-parser', sub: 'DATA · 45% · 7m', badge: '●' },
          { icon: 'alert', title: 'ml-trainer', sub: 'ML · 18% · ERROR', badge: '!' },
          { icon: 'activity', title: 'web-scraper', sub: 'SCRAPE · 30% · PENDING', badge: '○' },
        ]},
        { type: 'text', label: 'Recent Event', value: 'test-runner: suite_alpha 48/48 passed · 42s ago' },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '8' },
          { label: 'Paused', value: '2' },
          { label: 'Idle', value: '2' },
        ]},
        { type: 'progress', items: [
          { label: 'code-gen-01 · CPU 12%', pct: 12 },
          { label: 'test-runner · CPU 22%', pct: 22 },
          { label: 'doc-parser · CPU 8%', pct: 8 },
          { label: 'ml-trainer · CPU 0% (error)', pct: 0 },
          { label: 'notify-svc · CPU 3%', pct: 3 },
        ]},
        { type: 'tags', label: 'Agent types', items: ['CODE', 'TEST', 'DATA', 'ML', 'SCRAPE', 'SVC'] },
      ],
    },
    {
      id: 'feed', label: 'Feed',
      content: [
        { type: 'list', items: [
          { icon: 'check', title: 'PASS · test-runner', sub: 'suite_alpha 48/48 · 09:41:22', badge: '✓' },
          { icon: 'alert', title: 'ERROR · ml-trainer', sub: 'OOMError: memory exceeded · 09:40:07', badge: '!' },
          { icon: 'code', title: 'WRITE · code-gen-01', sub: 'Created auth/middleware.ts · 09:39:55', badge: '↑' },
          { icon: 'eye', title: 'READ · doc-parser', sub: 'Parsed 24 documents · 09:39:12', badge: '↓' },
          { icon: 'layers', title: 'QUEUE · web-scraper', sub: 'Queued 15 URLs · 09:38:40', badge: '⋯' },
          { icon: 'share', title: 'SEND · notify-svc', sub: 'Dispatched 3 Slack alerts · 09:38:11', badge: '→' },
        ]},
      ],
    },
    {
      id: 'tasks', label: 'Tasks',
      content: [
        { type: 'metric-row', items: [
          { label: 'Queued', value: '24' },
          { label: 'Active', value: '8' },
          { label: 'Done', value: '142' },
        ]},
        { type: 'progress', items: [
          { label: 'T-091 · Refactor auth middleware', pct: 72 },
          { label: 'T-090 · Parse Q1 financial reports', pct: 45 },
          { label: 'T-089 · Run integration test suite', pct: 89 },
          { label: 'T-088 · Scrape competitor pricing', pct: 0 },
          { label: 'T-087 · Train v2.4 recommendation model', pct: 18 },
          { label: 'T-086 · Send weekly digest emails', pct: 100 },
        ]},
      ],
    },
    {
      id: 'inspect', label: 'Inspector',
      content: [
        { type: 'metric', label: 'Inspecting', value: 'code-gen-01', sub: 'CODE AGENT · Running' },
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '14m' },
          { label: 'Memory', value: '142MB' },
          { label: 'CPU', value: '12%' },
        ]},
        { type: 'progress', items: [
          { label: 'Task T-091 completion', pct: 72 },
          { label: 'CPU utilisation', pct: 12 },
          { label: 'Memory headroom', pct: 72 },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'read_file', sub: 'src/auth/middleware.ts → 312 bytes', badge: '0.2s' },
          { icon: 'code', title: 'write_file', sub: 'src/auth/middleware.ts → written', badge: '0.1s' },
          { icon: 'check', title: 'run_tests', sub: 'auth.test.ts → 12/12 pass', badge: '4.2s' },
          { icon: 'zap', title: 'call_llm', sub: 'strategy analysis → 842 tokens', badge: '1.8s' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'agents', label: 'Agents', icon: 'activity' },
    { id: 'feed', label: 'Feed', icon: 'list' },
    { id: 'tasks', label: 'Tasks', icon: 'layers' },
    { id: 'inspect', label: 'Inspector', icon: 'search' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'nexus-mock', 'NEXUS — Interactive Mock');
console.log('Mock live at:', result.url);
