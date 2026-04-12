import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MESH',
  tagline:   'Command your AI agent fleet.',
  archetype: 'developer-tools',
  palette: {
    bg:      '#080A0F',
    surface: '#0E1117',
    text:    '#D4D8E8',
    accent:  '#6366F1',
    accent2: '#10D9A0',
    muted:   'rgba(212,216,232,0.38)',
  },
  lightPalette: {
    bg:      '#F5F6FA',
    surface: '#FFFFFF',
    text:    '#080A0F',
    accent:  '#6366F1',
    accent2: '#059669',
    muted:   'rgba(8,10,15,0.42)',
  },
  screens: [
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric', label: 'Fleet Status', value: '4/4', sub: '12 tasks running · $0.42/min compute · 92% success rate' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '4' },
          { label: 'Tasks', value: '12' },
          { label: 'Done Today', value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'AGENT-01 · Feature Dev', sub: 'Implementing auth middleware', badge: '73%' },
          { icon: 'activity', title: 'AGENT-04 · Test Writer', sub: 'Unit tests for auth module', badge: '88%' },
          { icon: 'eye', title: 'AGENT-02 · Code Review', sub: 'Reviewing PR #247 — API refactor', badge: '45%' },
          { icon: 'settings', title: 'AGENT-03 · Debug Assist', sub: 'Awaiting task assignment', badge: 'IDLE' },
        ]},
        { type: 'text', label: '⬡ Fleet Health', value: 'All agents operational. AGENT-01 has highest task load. Consider spinning up AGENT-05 if queue grows beyond 6 pending tasks.' },
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'metric', label: 'Live Event Stream', value: '●', sub: 'Real-time · Last update 3s ago' },
        { type: 'list', items: [
          { icon: 'code', title: 'AGENT-01 · Commit', sub: '3 files to feature/auth-middleware', badge: '14:23' },
          { icon: 'check', title: 'AGENT-04 · Tests', sub: '14 unit tests · 100% pass rate', badge: '14:22' },
          { icon: 'eye', title: 'AGENT-02 · PR Review', sub: '2 inline comments on PR #247', badge: '14:21' },
          { icon: 'alert', title: 'AGENT-01 · Error', sub: 'TypeScript: missing type definition', badge: '14:20' },
          { icon: 'zap', title: 'AGENT-01 · Retry', sub: 'Resolved import error · retrying', badge: '14:19' },
          { icon: 'star', title: 'AGENT-03 · Assigned', sub: 'New task: debug rate limiter', badge: '14:18' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Commits', 'PRs', 'Errors', 'Tests'] },
      ],
    },
    {
      id: 'tasks', label: 'Tasks',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '12' },
          { label: 'Queued', value: '4' },
          { label: 'Done Today', value: '47' },
        ]},
        { type: 'progress', items: [
          { label: 'Auth middleware — AGENT-01', pct: 73 },
          { label: 'Unit tests for auth — AGENT-04', pct: 88 },
          { label: 'PR #247 review — AGENT-02', pct: 45 },
          { label: 'Debug rate limiter — AGENT-03', pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'list', title: 'Refactor DB connection pool', sub: 'Queued · Unassigned', badge: '—' },
          { icon: 'list', title: 'Add OpenAPI schema validation', sub: 'Queued · Unassigned', badge: '—' },
          { icon: 'list', title: 'Write integration tests', sub: 'Queued · AGENT-04 preferred', badge: '—' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: 'Tasks Completed This Week', value: '847', sub: '↑ 34% vs last week · Record pace' },
        { type: 'metric-row', items: [
          { label: 'Avg Complete', value: '4.2m' },
          { label: 'Errors Today', value: '3' },
          { label: 'Cost Today', value: '$12.40' },
        ]},
        { type: 'progress', items: [
          { label: 'AGENT-04 · 97% success · 198 tasks', pct: 97 },
          { label: 'AGENT-01 · 94% success · 247 tasks', pct: 94 },
          { label: 'AGENT-02 · 91% success · 184 tasks', pct: 91 },
          { label: 'AGENT-03 · 88% success · 218 tasks', pct: 88 },
        ]},
        { type: 'tags', label: 'Error Types', items: ['TypeScript 43%', 'Timeout 28%', 'API 18%', 'Other 11%'] },
      ],
    },
    {
      id: 'config', label: 'Config',
      content: [
        { type: 'metric', label: 'Daily Budget', value: '25%', sub: '$12.40 of $50.00 used today · $2.00 per-task limit' },
        { type: 'progress', items: [
          { label: 'Budget used today', pct: 25 },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'AGENT-01', sub: 'gpt-4o · Feature development', badge: 'ON' },
          { icon: 'code', title: 'AGENT-02', sub: 'claude-3.5-sonnet · Code review', badge: 'ON' },
          { icon: 'check', title: 'AGENT-04', sub: 'claude-3.5-sonnet · Test generation', badge: 'ON' },
          { icon: 'settings', title: 'AGENT-03', sub: 'gpt-4o-mini · Debug support', badge: 'ON' },
        ]},
        { type: 'tags', label: 'Permissions Active', items: ['File Write ✓', 'Git Push ✓', 'PR Create ✓', 'Deploy ✗'] },
      ],
    },
  ],
  nav: [
    { id: 'agents',    label: 'Agents',    icon: 'activity' },
    { id: 'activity',  label: 'Activity',  icon: 'zap' },
    { id: 'tasks',     label: 'Tasks',     icon: 'list' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'config',    label: 'Config',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mesh-mock', 'MESH — Interactive Mock');
console.log('Mock live at:', result.url);
