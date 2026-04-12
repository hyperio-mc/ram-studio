import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LODE',
  tagline:   'Codebase Intelligence',
  archetype: 'developer-tools',

  palette: {
    bg:      '#F5F0E8',
    surface: '#EDE8DF',
    text:    '#1A1818',
    accent:  '#B85C38',
    accent2: '#4A7C6F',
    muted:   'rgba(26,24,24,0.40)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#B85C38',
    accent2: '#4A7C6F',
    muted:   'rgba(26,24,24,0.38)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric',     label: 'Debt Score',    value: '74',  sub: 'out of 100 — improving' },
        { type: 'metric-row', items: [
          { label: 'Coverage',  value: '87%'  },
          { label: 'Velocity',  value: '4.2×' },
          { label: 'Issues',    value: '23'   },
        ]},
        { type: 'progress', items: [
          { label: 'Security debt',    pct: 82 },
          { label: 'Complexity debt',  pct: 63 },
          { label: 'Coverage gap',     pct: 44 },
          { label: 'Dep rot',          pct: 38 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'auth/session.ts:142', sub: 'Unhandled promise rejection', badge: 'ERR' },
          { icon: 'alert', title: 'core/queue.ts:231',   sub: 'EventEmitter memory leak',    badge: 'ERR' },
          { icon: 'zap',   title: 'api/routes/user.ts',  sub: 'SQL injection risk',          badge: 'WARN' },
        ]},
      ],
    },
    {
      id: 'issues',
      label: 'Issues',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',    value: '23' },
          { label: 'Critical', value: '3'  },
          { label: 'Warning',  value: '8'  },
          { label: 'Info',     value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'auth/session.ts',      sub: 'Unhandled promise rejection',           badge: 'HIGH' },
          { icon: 'alert', title: 'core/queue.ts',        sub: 'EventEmitter memory leak',              badge: 'HIGH' },
          { icon: 'zap',   title: 'api/routes/user.ts',   sub: 'SQL injection — param unsanitized',     badge: 'MED'  },
          { icon: 'zap',   title: 'services/billing.ts',  sub: 'Deprecated Stripe API method',          badge: 'MED'  },
          { icon: 'eye',   title: 'db/migrations/045',    sub: 'Missing index on users.email',          badge: 'LOW'  },
          { icon: 'code',  title: 'utils/logger.ts',      sub: 'Console.log in production path',       badge: 'LOW'  },
          { icon: 'zap',   title: 'api/middleware/rate',  sub: 'Rate limit bypass via header spoof',    badge: 'HIGH' },
        ]},
      ],
    },
    {
      id: 'dependencies',
      label: 'Deps',
      content: [
        { type: 'metric-row', items: [
          { label: 'Up to date', value: '31' },
          { label: 'Outdated',   value: '8'  },
          { label: 'Critical',   value: '3'  },
        ]},
        { type: 'tags', label: 'Critical Packages', items: ['lodash 4.17.11', 'node-fetch 2.6.1', 'json-web-token 8.5.1'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'lodash',         sub: 'Prototype pollution CVE-2019-10744',     badge: 'CVE'  },
          { icon: 'alert', title: 'node-fetch',     sub: 'ReDoS vulnerability in URL parsing',     badge: 'CVE'  },
          { icon: 'alert', title: 'json-web-token', sub: 'Algorithm confusion attack vector',      badge: 'CVE'  },
          { icon: 'zap',   title: 'prisma',         sub: '5.1.0 → 5.13.0 (120d behind)',          badge: 'OUT'  },
          { icon: 'zap',   title: 'axios',          sub: '1.4.0 → 1.7.2 (90d behind)',            badge: 'OUT'  },
          { icon: 'zap',   title: 'typescript',     sub: '5.0.4 → 5.4.3 (45d behind)',            badge: 'OUT'  },
        ]},
      ],
    },
    {
      id: 'codebase-map',
      label: 'Map',
      content: [
        { type: 'text', label: 'Heat View', value: 'Relative debt density by module. Brighter = more debt.' },
        { type: 'progress', items: [
          { label: 'auth/ (8 files)',              pct: 90 },
          { label: 'api/routes/ (24 files)',       pct: 82 },
          { label: 'services/ (18 files)',         pct: 71 },
          { label: 'core/ (12 files)',             pct: 63 },
          { label: 'db/ (15 files)',               pct: 45 },
          { label: 'utils/ (22 files)',            pct: 30 },
          { label: 'components/ (31 files)',       pct: 28 },
          { label: 'config/ (9 files)',            pct: 15 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'auth/session.ts',    sub: 'Debt score 90 — worst file',  badge: '90' },
          { icon: 'alert', title: 'api/routes/user.ts', sub: 'Debt score 82 — up +3 today', badge: '82' },
          { icon: 'zap',   title: 'api/routes/auth.ts', sub: 'Debt score 79 — trending up', badge: '79' },
        ]},
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      content: [
        { type: 'metric', label: 'Sprint 24', value: '−9', sub: 'debt points reduced this sprint' },
        { type: 'metric-row', items: [
          { label: 'Issues Closed', value: '17' },
          { label: 'Coverage Gain', value: '+4%' },
          { label: 'New Deps',      value: '3'   },
        ]},
        { type: 'tags', label: 'Debt by Category', items: ['Security 38%', 'Perf 24%', 'Complexity 20%', 'Style 12%', 'Docs 6%'] },
        { type: 'list', items: [
          { icon: 'star',     title: '@alex',   sub: '8 issues fixed this sprint', badge: '+12' },
          { icon: 'star',     title: '@morgan', sub: '5 issues fixed this sprint', badge: '+8'  },
          { icon: 'activity', title: '@dev',    sub: '4 issues fixed this sprint', badge: '+6'  },
        ]},
        { type: 'text', label: 'Next Sprint Focus', value: 'Priority: resolve 3 CVE-flagged dependencies and reduce auth module debt below 80.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard',     label: 'Dashboard', icon: 'activity' },
    { id: 'issues',        label: 'Issues',    icon: 'alert'    },
    { id: 'dependencies',  label: 'Deps',      icon: 'layers'   },
    { id: 'codebase-map',  label: 'Map',       icon: 'grid'     },
    { id: 'reports',       label: 'Reports',   icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lode-mock', 'LODE — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/lode-mock');
