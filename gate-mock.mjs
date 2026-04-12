import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GATE',
  tagline:   'Every merge, reviewed.',
  archetype: 'dev-tools',
  palette: {            // DARK theme (primary)
    bg:      '#0B0E14',
    surface: '#1C2130',
    text:    '#E0E6F2',
    accent:  '#00D4A4',
    accent2: '#7B6FFF',
    muted:   'rgba(224,230,242,0.42)',
  },
  lightPalette: {       // LIGHT theme
    bg:      '#F4F6FA',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#009E7A',
    accent2: '#5D52CC',
    muted:   'rgba(13,17,23,0.45)',
  },
  screens: [
    {
      id: 'queue', label: 'PR Queue',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open PRs', value: '7' },
          { label: 'Avg Score', value: '84' },
          { label: 'Blocked', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'feat: streaming inference cache', sub: 'feat/stream-cache · akshat · 2h', badge: '91' },
          { icon: 'eye',   title: 'fix: rate limiter race condition', sub: 'fix/rate-limit · mei · 5h', badge: '73' },
          { icon: 'alert', title: 'refactor: auth middleware split', sub: 'refactor/auth-mw · dan · 1d', badge: '48' },
          { icon: 'check', title: 'docs: API reference v2.0', sub: 'docs/api-v2 · priya · 1d', badge: '96' },
        ]},
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'metric', label: 'fix/rate-limit', value: '73', sub: '3 files · +28 -12 · by mei · 5h ago' },
        { type: 'list', items: [
          { icon: 'code', title: 'middleware/rateLimit.ts', sub: '+14 -8', badge: '⚠' },
          { icon: 'code', title: 'utils/lock.ts', sub: '+11 -4', badge: '✓' },
          { icon: 'code', title: 'tests/rateLimit.test.ts', sub: '+3 -0', badge: '✓' },
        ]},
        { type: 'text', label: '◌ Promise leak risk', value: 'Unawaited branch may silently leak on timeout path. rateLimit.ts:51' },
        { type: 'tags', label: 'AI actions', items: ['✦ Fix', 'Explain', 'Ignore'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'AI Review Score', value: '84', sub: '30-day avg · ↑ +7%' },
        { type: 'metric-row', items: [
          { label: 'Issues', value: '29' },
          { label: 'Fixed', value: '23' },
          { label: 'Open', value: '6' },
        ]},
        { type: 'progress', items: [
          { label: 'middleware/rateLimit.ts', pct: 38 },
          { label: 'api/inference.ts',        pct: 54 },
          { label: 'auth/session.ts',         pct: 62 },
          { label: 'db/cache.ts',             pct: 74 },
          { label: 'utils/logger.ts',         pct: 83 },
        ]},
        { type: 'tags', label: 'Issue types', items: ['Security ×3', 'Perf ×7', 'Style ×14', 'Logic ×5'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric', label: 'Gate Review Agent', value: 'Active', sub: 'Reviewing 2 PRs · last action 4 min ago' },
        { type: 'metric-row', items: [
          { label: 'Reviewed', value: '47' },
          { label: 'Fixed', value: '23' },
          { label: 'Blocked', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',     title: 'Gate Review Agent', sub: 'Reviewing 2 open PRs · active', badge: '●' },
          { icon: 'check',   title: 'Style Enforcer', sub: 'ESLint + Prettier auto-fix · active', badge: '●' },
          { icon: 'search',  title: 'Dep Scanner', sub: 'CVE + outdated packages · active', badge: '●' },
          { icon: 'layers',  title: 'Release Drafter', sub: 'Auto-generates changelogs · idle', badge: '◌' },
        ]},
        { type: 'text', label: 'Latest: 12:02', value: 'Detected Promise leak in rateLimit.ts:51' },
      ],
    },
  ],
  nav: [
    { id: 'queue',    label: 'Queue',    icon: 'grid' },
    { id: 'review',   label: 'Review',   icon: 'code' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'agents',   label: 'Agents',   icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'gate-mock', 'GATE — Interactive Mock');
console.log('Mock live at:', result.url);
