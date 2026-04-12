import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'COBALT',
  tagline:   'Your stack. One terminal.',
  archetype: 'developer-ops-dashboard',

  // Dark (primary)
  palette: {
    bg:      '#08090E',
    surface: '#10131C',
    text:    '#CDD9EE',
    accent:  '#3DFFA0',
    accent2: '#6E3FFF',
    muted:   'rgba(205, 217, 238, 0.35)',
  },

  // Light (toggle)
  lightPalette: {
    bg:      '#F0F2F7',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#00C67A',
    accent2: '#5B2FE0',
    muted:   'rgba(13, 17, 23, 0.40)',
  },

  screens: [
    {
      id: 'overview', label: 'Grid',
      content: [
        { type: 'metric', label: 'Uptime', value: '99.97%', sub: '30-day rolling avg' },
        { type: 'metric-row', items: [
          { label: 'Deploys Today', value: '14' },
          { label: 'Open PRs', value: '28' },
          { label: 'Error Rate', value: '0.03%' }
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'api-gateway v3.14.2 → prod', sub: '12 min ago', badge: '✓ SUCCESS' },
          { icon: 'zap', title: 'auth-service v2.1.0 → prod', sub: '1h ago',     badge: '✓ SUCCESS' },
          { icon: 'activity', title: 'ml-pipeline v1.9.0 → stg', sub: '2h ago', badge: '◎ RUNNING' },
          { icon: 'alert', title: 'billing-svc v2.3.1 → prod', sub: '3h ago',   badge: '✗ FAILED' },
        ]},
        { type: 'progress', items: [
          { label: 'API Gateway — load', pct: 64 },
          { label: 'ML Pipeline — load', pct: 82 },
          { label: 'Auth Service — load', pct: 31 },
          { label: 'DB Primary — load', pct: 48 },
        ]},
        { type: 'text', label: 'Terminal', value: '$ cobalt status --live\n● api-gateway UP 12ms\n● auth-service UP 8ms\n⚠ ml-pipeline 340ms\n● billing-svc UP 14ms' },
      ],
    },
    {
      id: 'repos', label: 'Repos',
      content: [
        { type: 'metric-row', items: [
          { label: 'Repositories', value: '5' },
          { label: 'Active', value: '4' },
          { label: 'Total Stars', value: '2.9K' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'api-gateway', sub: 'Go · 847★ · 3 PRs · health 94%', badge: 'ACTIVE' },
          { icon: 'layers', title: 'ml-pipeline', sub: 'Python · 1.2K★ · 7 PRs · health 71%', badge: '⚠ CI FAIL' },
          { icon: 'layers', title: 'auth-service', sub: 'TypeScript · 234★ · 1 PR · health 88%', badge: 'ACTIVE' },
          { icon: 'layers', title: 'design-system', sub: 'TypeScript · 512★ · 0 PRs · health 99%', badge: 'STABLE' },
          { icon: 'layers', title: 'billing-svc', sub: 'Rust · 89★ · 2 PRs · health 85%', badge: 'ACTIVE' },
        ]},
        { type: 'progress', items: [
          { label: 'TypeScript 42%', pct: 42 },
          { label: 'Go 28%', pct: 28 },
          { label: 'Python 19%', pct: 19 },
          { label: 'Rust 11%', pct: 11 },
        ]},
      ],
    },
    {
      id: 'deployments', label: 'Deploy',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today Total', value: '14' },
          { label: 'Success', value: '12' },
          { label: 'Failed', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'deploy-0491 · api-gateway', sub: 'aria.chen · 3m 12s · prod', badge: 'PASS' },
          { icon: 'activity', title: 'deploy-0490 · ml-pipeline', sub: 'rio.nakamura · ongoing · stg', badge: 'RUNNING' },
          { icon: 'alert', title: 'deploy-0489 · billing-svc', sub: 'sam.osei · 1m 44s · prod', badge: 'FAILED' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 33 },
          { label: 'Tue', pct: 50 },
          { label: 'Wed', pct: 25 },
          { label: 'Thu', pct: 67 },
          { label: 'Fri', pct: 42 },
        ]},
        { type: 'tags', label: 'Environments', items: ['production', 'staging', 'preview'] },
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Events', value: '14.8K' },
          { label: 'Errors', value: '4' },
          { label: 'Warnings', value: '23' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: '[ERROR] billing-svc', sub: 'Stripe webhook signature verification failed', badge: '14:32:18' },
          { icon: 'alert', title: '[WARN] ml-pipeline', sub: 'GPU memory at 94% — consider scaling', badge: '14:32:17' },
          { icon: 'activity', title: '[INFO] api-gateway', sub: 'GET /v3/users/batch 200 12ms', badge: '14:32:15' },
          { icon: 'alert', title: '[ERROR] billing-svc', sub: 'Retry 2/3: downstream timeout on payment', badge: '14:32:13' },
          { icon: 'activity', title: '[WARN] queue-worker', sub: 'Job retry queue depth at 847 — threshold', badge: '14:32:10' },
          { icon: 'activity', title: '[INFO] cdn-edge', sub: 'Cache purged assets/v3.14.2/* — 2,491 objects', badge: '14:32:12' },
        ]},
        { type: 'tags', label: 'Log Level Filter', items: ['ALL', 'ERROR', 'WARN', 'INFO'] },
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Contributors', value: '4' },
          { label: 'Commits/30D', value: '390' },
          { label: 'Reviews', value: '149' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'aria.chen — Platform Lead', sub: '142 commits · 67 reviews · streak 14d', badge: '18 PRs' },
          { icon: 'user', title: 'rio.nakamura — ML Eng', sub: '98 commits · 23 reviews · streak 8d', badge: '11 PRs' },
          { icon: 'user', title: 'sam.osei — Backend', sub: '87 commits · 41 reviews · streak 21d', badge: '14 PRs' },
          { icon: 'user', title: 'dev.santos — Frontend', sub: '63 commits · 18 reviews · streak 5d', badge: '9 PRs' },
        ]},
        { type: 'progress', items: [
          { label: 'aria.chen commits', pct: 36 },
          { label: 'rio.nakamura commits', pct: 25 },
          { label: 'sam.osei commits', pct: 22 },
          { label: 'dev.santos commits', pct: 16 },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview',    label: 'Grid',   icon: 'grid'     },
    { id: 'repos',       label: 'Repos',  icon: 'layers'   },
    { id: 'deployments', label: 'Deploy', icon: 'zap'      },
    { id: 'logs',        label: 'Logs',   icon: 'list'     },
    { id: 'team',        label: 'Team',   icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cobalt-mock', 'COBALT — Interactive Mock');
console.log('Mock live at:', result.url);
