import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KILN',
  tagline:   'Build & Deploy Pipeline Monitor',
  archetype: 'developer-tools',

  palette: {
    bg:      '#120F0A',
    surface: '#1C1711',
    text:    '#F5EDD8',
    accent:  '#F59E0B',
    accent2: '#22C55E',
    muted:   'rgba(245,237,216,0.35)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1711',
    accent:  '#D97706',
    accent2: '#16A34A',
    muted:   'rgba(28,23,17,0.4)',
  },

  screens: [
    {
      id: 'pipeline',
      label: 'Pipeline',
      content: [
        { type: 'metric-row', items: [
          { label: 'TODAY',   value: '47' },
          { label: 'SUCCESS', value: '41' },
          { label: 'FAILED',  value: '4'  },
          { label: 'RUNNING', value: '2'  },
        ]},
        { type: 'list', items: [
          { icon: 'check-circle', title: '#2847 · main',         sub: 'feat: add agent spawn endpoint · 3m 12s',   badge: 'done' },
          { icon: 'loader',       title: '#2846 · feat/claw-v2', sub: 'fix: resolve context overflow · 1m 44s',    badge: 'running' },
          { icon: 'check-circle', title: '#2845 · main',         sub: 'chore: bump dependencies · 2m 58s',         badge: 'done' },
          { icon: 'x-circle',     title: '#2844 · feat/claw-v2', sub: 'wip: streaming token counter · 0m 42s',     badge: 'failed' },
          { icon: 'check-circle', title: '#2843 · hotfix/auth',  sub: 'fix: jwt refresh race condition · 1m 20s',  badge: 'done' },
          { icon: 'check-circle', title: '#2842 · main',         sub: 'feat: lobster fleet health · 4m 03s',       badge: 'done' },
        ]},
      ],
    },
    {
      id: 'build',
      label: 'Build',
      content: [
        { type: 'metric', label: 'BUILD #2846', value: 'RUNNING', sub: 'feat/claw-v2 · 1m 44s elapsed' },
        { type: 'metric-row', items: [
          { label: 'BRANCH',  value: 'feat/claw-v2' },
          { label: 'COMMIT',  value: 'a3f7c2d' },
          { label: 'TRIGGER', value: '@ram' },
        ]},
        { type: 'progress', items: [
          { label: 'lint',   pct: 100 },
          { label: 'test',   pct: 62  },
          { label: 'build',  pct: 0   },
          { label: 'deploy', pct: 0   },
        ]},
        { type: 'text', label: 'RUNNING STEP', value: 'Running integration tests — test/integration/agent-spawn.test.ts · 31/50 tests passed' },
        { type: 'list', items: [
          { icon: 'check', title: '✓ context isolation verified',   sub: '09:41:22 · INFO', badge: 'OK' },
          { icon: 'check', title: '✓ tool budget enforced',         sub: '09:41:20 · INFO', badge: 'OK' },
          { icon: 'alert-triangle', title: '⚠ memory 87% — near threshold', sub: '09:41:18 · WARN', badge: 'WARN' },
          { icon: 'x',     title: '✗ token count mismatch',         sub: '09:41:16 · ERROR', badge: 'ERR' },
        ]},
      ],
    },
    {
      id: 'logs',
      label: 'Logs',
      content: [
        { type: 'metric', label: 'LIVE STREAM', value: '#2846 · feat/claw-v2', sub: 'All levels · Recording' },
        { type: 'tags', label: 'FILTER', items: ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] },
        { type: 'list', items: [
          { icon: 'info',           title: '✓ context isolation verified — 8192 tok',  sub: '09:41:22.814 · INFO',  badge: 'INFO' },
          { icon: 'info',           title: '✓ tool budget enforced — max_calls: 50',   sub: '09:41:22.401 · INFO',  badge: 'INFO' },
          { icon: 'alert-triangle', title: '⚠ memory 87% — threshold 90%',            sub: '09:41:21.988 · WARN',  badge: 'WARN' },
          { icon: 'info',           title: '→ test 31/50: agent-spawn/isolation',      sub: '09:41:21.203 · INFO',  badge: 'INFO' },
          { icon: 'x-circle',       title: '✗ test 28/50 FAILED: token mismatch',      sub: '09:41:16.780 · ERROR', badge: 'ERR'  },
          { icon: 'info',           title: '✓ rate limiter: 100 req/s enforced',       sub: '09:41:15.320 · INFO',  badge: 'INFO' },
        ]},
      ],
    },
    {
      id: 'deploys',
      label: 'Deploys',
      content: [
        { type: 'metric', label: 'PRODUCTION · LIVE', value: 'v2.14.1 — main', sub: 'Deployed 2h ago · #2843 · 99.98% uptime' },
        { type: 'metric-row', items: [
          { label: 'BUILD',  value: '#2843'  },
          { label: 'COMMIT', value: 'a3f7c2d' },
          { label: 'UPTIME', value: '99.98%' },
        ]},
        { type: 'list', items: [
          { icon: 'check-circle', title: 'v2.14.1 · prod',    sub: 'feat: lobster fleet health · 2h ago',  badge: 'live'    },
          { icon: 'check-circle', title: 'v2.14.0 · prod',    sub: 'feat: agent spawn endpoint · 1d ago',  badge: 'done'    },
          { icon: 'check-circle', title: 'v2.13.5 · prod',    sub: 'fix: jwt refresh race · 2d ago',       badge: 'done'    },
          { icon: 'alert-triangle',title: 'v2.13.4 · prod',   sub: 'chore: update deps · 3d ago',          badge: 'rolled'  },
          { icon: 'check-circle', title: 'v2.13.3 · prod',    sub: 'feat: token streaming · 4d ago',       badge: 'done'    },
        ]},
      ],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      content: [
        { type: 'metric-row', items: [
          { label: 'SUCCESS RATE', value: '87.2%' },
          { label: 'AVG BUILD',   value: '2m 41s' },
          { label: 'TOTAL TODAY', value: '47'     },
        ]},
        { type: 'progress', items: [
          { label: 'Build success rate (24h)', pct: 87 },
          { label: 'Test pass rate',           pct: 94 },
          { label: 'Deploy success rate',      pct: 91 },
        ]},
        { type: 'text', label: 'FAILURE BREAKDOWN', value: 'Test failures: 8 (53%)  ·  Build errors: 4 (27%)  ·  Timeout: 2 (13%)  ·  Runner: 1 (7%)' },
        { type: 'list', items: [
          { icon: 'bar-chart', title: 'Test failures',  sub: '8 occurrences · 53% of failures', badge: '8' },
          { icon: 'bar-chart', title: 'Build errors',   sub: '4 occurrences · 27% of failures', badge: '4' },
          { icon: 'bar-chart', title: 'Timeout',        sub: '2 occurrences · 13% of failures', badge: '2' },
          { icon: 'bar-chart', title: 'Runner error',   sub: '1 occurrence  · 7% of failures',  badge: '1' },
        ]},
      ],
    },
    {
      id: 'config',
      label: 'Config',
      content: [
        { type: 'metric', label: 'REPOSITORY', value: 'hyperio-mc/ram-studio', sub: 'Connected · github.com/apps/kiln · Running' },
        { type: 'text', label: 'PIPELINE', value: 'Default branch: main  ·  Auto-deploy: ON  ·  Parallel jobs: 4  ·  Build timeout: 10m  ·  Cache: ON' },
        { type: 'text', label: 'NOTIFICATIONS', value: 'On failure: ON  ·  On deploy: ON  ·  Digest: daily' },
        { type: 'text', label: 'RUNNERS', value: 'Default: ubuntu-22-04-x64  ·  Region: us-east-1  ·  Max concurrent: 8' },
        { type: 'list', items: [
          { icon: 'settings', title: 'Auto-deploy on push',  sub: 'main branch only', badge: 'ON'  },
          { icon: 'settings', title: 'Cache dependencies',   sub: 'node_modules, pip', badge: 'ON'  },
          { icon: 'settings', title: 'Parallel jobs',        sub: 'max concurrent per run', badge: '4' },
          { icon: 'alert-triangle', title: 'Delete All Build History', sub: 'Danger zone — irreversible', badge: 'DEL' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'pipeline', label: 'Pipeline', icon: 'git-branch' },
    { id: 'deploys',  label: 'Deploys',  icon: 'upload-cloud' },
    { id: 'logs',     label: 'Logs',     icon: 'terminal' },
    { id: 'metrics',  label: 'Metrics',  icon: 'bar-chart-2' },
    { id: 'config',   label: 'Config',   icon: 'settings' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'kiln');
const result = await publishMock(built, 'kiln');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/kiln-mock`);
