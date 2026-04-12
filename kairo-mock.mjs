import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KAIRO',
  tagline:   'AI codebase intelligence, distilled',
  archetype: 'developer-tools',
  palette: {
    bg:      '#080C18',
    surface: '#0C1220',
    text:    '#E2E8F0',
    accent:  '#3D8EFF',
    accent2: '#22D3EE',
    muted:   'rgba(148,163,184,0.45)',
  },
  lightPalette: {
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#2563EB',
    accent2: '#0891B2',
    muted:   'rgba(15,23,42,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Repo Health', value: '94/100', sub: '↑ 3pts this week' },
        { type: 'metric-row', items: [
          { label: 'Coverage', value: '87%' },
          { label: 'Tech Debt', value: '2.4h' },
          { label: 'Velocity', value: '↑12%' },
        ]},
        { type: 'text', label: 'AI Signal', value: 'Active — 3 functions approaching complexity threshold in auth/' },
        { type: 'list', items: [
          { icon: 'code', title: 'Merged PR #241 — auth refactor', sub: 'Rakis S. · 2m ago', badge: '✓' },
          { icon: 'activity', title: 'Opened PR #242 — cache layer', sub: 'Dana K. · 18m ago', badge: '+' },
          { icon: 'layers', title: 'Pushed 4 commits to main', sub: 'Marcus L. · 1h ago', badge: '·' },
        ]},
        { type: 'text', label: 'Command Palette', value: 'Press ⌘K to search repos, ask AI questions, or jump to any screen' },
      ],
    },
    {
      id: 'repos',
      label: 'Repos',
      content: [
        { type: 'metric-row', items: [
          { label: 'Repos', value: '6' },
          { label: 'Active', value: '3' },
          { label: 'PRs Open', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'hyperio-core', sub: 'TypeScript · ★ 842', badge: '94%' },
          { icon: 'layers', title: 'design-studio', sub: 'JavaScript · ★ 318', badge: '88%' },
          { icon: 'zap', title: 'ram-sdk', sub: 'Rust · ★ 1,204', badge: '96%' },
          { icon: 'activity', title: 'api-gateway', sub: 'Go · ★ 567', badge: '71%' },
        ]},
        { type: 'progress', items: [
          { label: 'hyperio-core', pct: 94 },
          { label: 'ram-sdk', pct: 96 },
          { label: 'design-studio', pct: 88 },
          { label: 'api-gateway', pct: 71 },
        ]},
      ],
    },
    {
      id: 'review',
      label: 'Code Review',
      content: [
        { type: 'text', label: 'PR #241 — auth/session refactor', value: 'Rakis S. · Ready to merge · Low risk' },
        { type: 'metric-row', items: [
          { label: 'Added', value: '+247' },
          { label: 'Removed', value: '-83' },
          { label: 'Files', value: '12' },
        ]},
        { type: 'text', label: '◈ AI Review', value: 'Complete — 1 suggestion, 0 issues. Consider memoizing extractToken — called in hot path, could reduce latency ~12ms at p95.' },
        { type: 'list', items: [
          { icon: 'check', title: 'auth/session.ts', sub: '+12 lines · main change', badge: '+12' },
          { icon: 'check', title: 'auth/types.ts', sub: 'Type definitions updated', badge: '+3' },
          { icon: 'check', title: 'tests/session.test.ts', sub: 'New test coverage added', badge: '+8' },
        ]},
        { type: 'tags', label: 'Labels', items: ['auth', 'refactor', 'low-risk', 'ai-reviewed'] },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Velocity', value: '↑18%' },
          { label: 'Coverage', value: '87.3%' },
          { label: 'Debt', value: '2.4h' },
        ]},
        { type: 'progress', items: [
          { label: 'Test Coverage', pct: 87 },
          { label: 'Code Quality', pct: 94 },
          { label: 'Security Score', pct: 91 },
          { label: 'Performance', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Rakis S.', sub: '47 commits · 38%', badge: '38%' },
          { icon: 'user', title: 'Dana K.', sub: '31 commits · 25%', badge: '25%' },
          { icon: 'user', title: 'Marcus L.', sub: '28 commits · 23%', badge: '23%' },
        ]},
        { type: 'metric', label: 'Avg PR Size', value: '+148', sub: 'lines per PR (↓ 12% from last month)' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '2' },
          { label: 'Warnings', value: '5' },
          { label: 'Info', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Exposed API key pattern', sub: 'ram-sdk/src/config.ts:47 · CRITICAL', badge: '⚠' },
          { icon: 'alert', title: 'lodash CVE-2024-8371', sub: 'severity 9.8 — update immediately · CRITICAL', badge: '⚠' },
          { icon: 'eye', title: 'Complexity spike in auth/middleware', sub: 'cyclomatic 34 (threshold 20) · WARNING', badge: '!' },
          { icon: 'filter', title: '12 unused exports detected', sub: 'utils/legacy.ts + 10 more · WARNING', badge: '!' },
          { icon: 'check', title: 'Coverage milestone: 87%', sub: 'Up from 83% last month · INFO', badge: '✓' },
        ]},
        { type: 'tags', label: 'Affected Repos', items: ['ram-sdk', 'hyperio-core', 'api-gateway', 'design-studio'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'repos', label: 'Repos', icon: 'layers' },
    { id: 'review', label: 'Review', icon: 'code' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'alerts', label: 'Alerts', icon: 'alert' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'kairo-mock', 'KAIRO — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/kairo-mock`);
