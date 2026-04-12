// LYNX — Svelte Interactive Mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LYNX',
  tagline:   'Your codebase, in sharp focus.',
  archetype: 'code-intelligence',
  palette: {
    bg:      '#060A17',
    surface: '#0D1424',
    text:    '#E2E6F8',
    accent:  '#818CF8',
    accent2: '#34D399',
    muted:   'rgba(226,230,248,0.45)',
  },
  lightPalette: {
    bg:      '#F4F6FF',
    surface: '#FFFFFF',
    text:    '#0E1428',
    accent:  '#5B63E8',
    accent2: '#16A37A',
    muted:   'rgba(14,20,40,0.45)',
  },
  screens: [
    {
      id: 'scan', label: 'Scan',
      content: [
        { type: 'metric', label: 'Health Score', value: '87', sub: 'main branch · last scan 2m ago' },
        { type: 'metric-row', items: [
          { label: 'FILES',    value: '1,247' },
          { label: 'COVERAGE', value: '74%'   },
          { label: 'ISSUES',   value: '38'    },
          { label: 'AGENTS',   value: '3'     },
        ]},
        { type: 'progress', items: [
          { label: 'TypeScript', pct: 58 },
          { label: 'Python',     pct: 22 },
          { label: 'CSS',        pct: 12 },
          { label: 'Other',      pct: 8  },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Coverage up 4% since last sprint. Auth module needs attention — 12 uncovered branches found.' },
        { type: 'list', items: [
          { icon: 'chart', title: 'Scan Trend',    sub: '14-day history · +15 pts improvement', badge: '↑87' },
          { icon: 'code',  title: 'Last Commit',   sub: 'Extract auth hooks · AI · REFACTOR-α',  badge: '2m' },
          { icon: 'alert', title: 'Top Issue',     sub: 'SQL injection vector · src/lib/db.ts',   badge: '!' },
        ]},
      ],
    },
    {
      id: 'explorer', label: 'Files',
      content: [
        { type: 'metric', label: 'Repository', value: '1,247', sub: '38 issues across 6 directories' },
        { type: 'list', items: [
          { icon: 'layers', title: 'src/',         sub: 'health 85 · 14 issues · 78% coverage',   badge: '85' },
          { icon: 'code',   title: 'components/',  sub: 'health 92 · 3 issues  · 88% coverage',   badge: '92' },
          { icon: 'alert',  title: 'Table.tsx',    sub: 'health 55 · 7 issues  · 41% coverage',   badge: '55' },
          { icon: 'alert',  title: 'auth.ts',      sub: 'health 61 · 5 issues  · 48% coverage',   badge: '61' },
          { icon: 'check',  title: 'Button.tsx',   sub: 'health 98 · 0 issues  · 100% coverage',  badge: '98' },
          { icon: 'check',  title: 'utils.ts',     sub: 'health 88 · 1 issue   · 85% coverage',   badge: '88' },
          { icon: 'check',  title: 'tests/',       sub: 'health 94 · 0 issues',                   badge: '94' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Issues', 'Low Cover', 'Modified'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'ACTIVE',    value: '3'  },
          { label: 'QUEUED',    value: '2'  },
          { label: 'DONE TODAY',value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: '01 · REFACTOR-α', sub: 'Extracting auth hooks · 14m · 68%',      badge: '▶' },
          { icon: 'zap',      title: '02 · COVER-β',    sub: 'Writing Table tests  · 9m  · 44%',       badge: '▶' },
          { icon: 'activity', title: '03 · AUDIT-γ',    sub: 'XSS scan complete · awaiting review',    badge: '⏸' },
          { icon: 'code',     title: '04 · COVER-δ',    sub: 'Queued: settings.tsx coverage',          badge: '…' },
          { icon: 'code',     title: '05 · LINT-ε',     sub: 'Queued: ESLint rule enforcement',        badge: '…' },
        ]},
        { type: 'progress', items: [
          { label: 'REFACTOR-α progress', pct: 68 },
          { label: 'COVER-β progress',    pct: 44 },
        ]},
      ],
    },
    {
      id: 'issues', label: 'Issues',
      content: [
        { type: 'metric-row', items: [
          { label: 'CRITICAL', value: '3'  },
          { label: 'HIGH',     value: '9'  },
          { label: 'MEDIUM',   value: '14' },
          { label: 'LOW',      value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'LX-041 · CRITICAL', sub: 'SQL injection in search query builder · 2h',   badge: '🔴' },
          { icon: 'alert', title: 'LX-038 · CRITICAL', sub: 'Unvalidated input passed to eval() · 1h',      badge: '🔴' },
          { icon: 'alert', title: 'LX-035 · HIGH',     sub: 'No rate limiting on /api/export · 3h',         badge: '🟡' },
          { icon: 'alert', title: 'LX-029 · HIGH',     sub: 'Memory leak in WebSocket manager · 4h',        badge: '🟡' },
          { icon: 'eye',   title: 'LX-022 · MEDIUM',   sub: 'Modal missing keyboard trap (a11y) · 1.5h',    badge: '🔵' },
        ]},
        { type: 'progress', items: [
          { label: 'Critical', pct: 8  },
          { label: 'High',     pct: 24 },
          { label: 'Medium',   pct: 37 },
          { label: 'Low',      pct: 31 },
        ]},
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'metric', label: 'This Month', value: '142', sub: 'commits · 3 agent · 139 human' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'AI · REFACTOR-α · 2m ago',  sub: 'Extract auth hooks · +142 −88',         badge: 'a7f3c2d' },
          { icon: 'user',     title: 'Elena M. · 1h ago',          sub: 'Add pagination to /api/export',         badge: 'b9e14ab' },
          { icon: 'user',     title: 'James T. · 3h ago',          sub: 'feat: modal keyboard trap impl',        badge: 'c2d8f7e' },
          { icon: 'zap',      title: 'AI · COVER-β · 5h ago',      sub: 'Add test suite for Table (WIP)',        badge: 'de1c9b3' },
          { icon: 'user',     title: 'Elena M. · 1d ago',          sub: 'refactor: clean up deprecated APIs',    badge: 'ea7f2d1' },
          { icon: 'user',     title: 'Rakis Dev · 1d ago',         sub: 'chore: update dependencies',            badge: 'f03b8c6' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'AI Agent', 'Human', 'Fixes', 'Tests'] },
      ],
    },
  ],
  nav: [
    { id: 'scan',     label: 'Scan',    icon: 'activity' },
    { id: 'explorer', label: 'Files',   icon: 'layers'   },
    { id: 'agents',   label: 'Agents',  icon: 'zap'      },
    { id: 'issues',   label: 'Issues',  icon: 'alert'    },
    { id: 'history',  label: 'History', icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lynx-mock', 'LYNX — Interactive Mock');
console.log('Mock live at:', result.url);
