import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DIFF',
  tagline:   'AI pull request intelligence. Every merge, made smarter.',
  archetype: 'developer-tools-ai',
  palette: {           // DARK theme
    bg:      '#0C0D12',
    surface: '#14151D',
    text:    '#E2E4F0',
    accent:  '#7C6DFA',
    accent2: '#00D4A8',
    muted:   'rgba(226,228,240,0.35)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F4F5FA',
    surface: '#FFFFFF',
    text:    '#131420',
    accent:  '#5B4EDB',
    accent2: '#00A882',
    muted:   'rgba(19,20,32,0.4)',
  },
  screens: [
    {
      id: 'feed', label: 'Feed',
      content: [
        { type: 'metric', label: 'Codebase Health', value: '91%', sub: 'Pass rate · 14 open PRs · diff-agent active' },
        { type: 'metric-row', items: [
          { label: 'Open PRs', value: '14' },
          { label: 'Needs Review', value: '3' },
          { label: 'Failing', value: '2' },
        ]},
        { type: 'text', label: 'Agent Status', value: 'diff-agent is reviewing 3 PRs. 127 suggestions made this sprint — 70% accepted by the team.' },
        { type: 'list', items: [
          { icon: 'lock', title: 'feat: add OAuth token refresh', sub: 'auth/token-refresh → main · Score: 92', badge: '92' },
          { icon: 'layers', title: 'refactor: migrate DB layer to ORM', sub: 'db/orm-migration → staging · Score: 71', badge: '71' },
          { icon: 'zap', title: 'fix: race condition in job queue', sub: 'bugfix/queue-race → main · Score: 88', badge: '88' },
          { icon: 'code', title: 'chore: update deps to latest', sub: 'deps/update → main · Score: 95', badge: '95' },
        ]},
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'text', label: 'PR: OAuth Token Refresh', value: 'auth/token-refresh → main · +182 −44 lines · AI review complete · 1 security suggestion pending.' },
        { type: 'metric-row', items: [
          { label: 'AI Score', value: '92/100' },
          { label: 'Files', value: '7' },
          { label: 'Checks', value: '✓ 6/6' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Missing rate limit', sub: 'refreshToken() endpoint vulnerable to spam', badge: '!' },
          { icon: 'check', title: 'Token expiry fix correct', sub: 'RFC 7519 compliant — expiresAt * 1000', badge: '✓' },
          { icon: 'check', title: 'AuthError throw preserved', sub: 'Error handling path unchanged', badge: '✓' },
          { icon: 'eye', title: 'isExpired() helper', sub: 'New utility function — consider unit test', badge: '→' },
        ]},
        { type: 'tags', label: 'AI Labels', items: ['Security', 'Auth', 'RFC 7519', 'Rate Limit'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Codebase Health', value: '87', sub: '▲ +4 vs last month · trending up' },
        { type: 'metric-row', items: [
          { label: 'W1 Quality', value: '78' },
          { label: 'W2 Quality', value: '82' },
          { label: 'W4 (now)', value: '91' },
        ]},
        { type: 'progress', items: [
          { label: 'src/auth/refresh.ts', pct: 94 },
          { label: 'src/db/UserRepo.ts',  pct: 78 },
          { label: 'src/queue/JobQueue.ts', pct: 65 },
          { label: 'src/api/middleware.ts', pct: 42 },
        ]},
        { type: 'text', label: 'Hotspot Alert', value: 'src/auth/refresh.ts has 94 changes in 30 days — highest churn in codebase. Consider refactor or feature flag.' },
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Review', value: '4.2h' },
          { label: 'Merge Rate', value: '91%' },
          { label: 'PRs/week', value: '9' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Kai L.', sub: '12 PRs · 34 comments · top reviewer', badge: '94' },
          { icon: 'user', title: 'Dev P.', sub: '11 PRs · 28 comments · consistent', badge: '88' },
          { icon: 'user', title: 'Sam W.', sub: '5 PRs · 11 comments · steady', badge: '82' },
          { icon: 'user', title: 'Mo R.', sub: '8 PRs · 19 comments · improving', badge: '76' },
        ]},
        { type: 'text', label: 'diff-agent Sprint Summary', value: 'Reviewed 36 PRs · 127 suggestions · 89 accepted (70%). Agent acceptance above team average.' },
      ],
    },
    {
      id: 'rules', label: 'Rules',
      content: [
        { type: 'text', label: 'diff-agent v2.4', value: 'Agent running · last sync 2 min ago · 4 active rules configured for this workspace.' },
        { type: 'list', items: [
          { icon: 'lock', title: 'Security scan', sub: 'Auth, injection, secrets · Critical', badge: 'ON' },
          { icon: 'alert', title: 'N+1 query detection', sub: 'ORM loop anti-patterns · High', badge: 'ON' },
          { icon: 'check', title: 'Test coverage gate', sub: 'Require ≥80% on changed files · Med', badge: 'ON' },
          { icon: 'code', title: 'Type safety enforcement', sub: 'Flag any/unknown in TS · Low', badge: 'OFF' },
        ]},
        { type: 'tags', label: 'Integrations', items: ['GitHub', 'Linear', 'Slack', 'CI/CD'] },
        { type: 'progress', items: [
          { label: 'Security coverage', pct: 100 },
          { label: 'N+1 detection', pct: 78 },
          { label: 'Coverage gate', pct: 85 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'feed',     label: 'Feed',    icon: 'grid' },
    { id: 'review',   label: 'Review',  icon: 'code' },
    { id: 'insights', label: 'Insights',icon: 'chart' },
    { id: 'team',     label: 'Team',    icon: 'user' },
    { id: 'rules',    label: 'Rules',   icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'diff-mock', 'DIFF — Interactive Mock');
console.log('Mock live at:', result.url);
