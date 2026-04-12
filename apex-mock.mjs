import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'APEX',
  tagline:   'Peak code quality, every sprint.',
  archetype: 'code-quality-saas',

  // LIGHT palette (primary — this run is light theme)
  palette: {
    bg:      '#F7F5F0',
    surface: '#FFFFFF',
    text:    '#1A1814',
    accent:  '#D9600A',
    accent2: '#1B7A4A',
    muted:   'rgba(26,24,20,0.40)',
  },

  // DARK palette (secondary toggle)
  lightPalette: {
    bg:      '#0F0D0A',
    surface: '#1C1916',
    text:    '#EDE8DF',
    accent:  '#E8742A',
    accent2: '#2ECC88',
    muted:   'rgba(237,232,223,0.38)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'QUALITY SCORE', value: '92', sub: 'Target 95 · ↑ +4 pts this week' },
        { type: 'metric-row', items: [
          { label: 'Issues',   value: '17'   },
          { label: 'Coverage', value: '84%'  },
          { label: 'P95 Build',value: '3.2ms'},
        ]},
        { type: 'text', label: 'RECENT PULL REQUESTS', value: '' },
        { type: 'list', items: [
          { icon: 'check', title: 'feat: add vector search index', sub: '→ main', badge: '94 ↑' },
          { icon: 'alert', title: 'fix: memory leak in parser loop', sub: '→ main', badge: '88 -1' },
          { icon: 'alert', title: 'refactor: auth middleware split', sub: '→ dev',  badge: '71 ↓' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['Run scan', 'View issues', 'Export', 'Config'] },
      ],
    },
    {
      id: 'issues',
      label: 'Issues',
      content: [
        { type: 'metric', label: 'OPEN ISSUES', value: '17', sub: 'Across 3 repositories' },
        { type: 'tags', label: 'Severity Filter', items: ['All (17)', 'Critical', 'High', 'Med', 'Low'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Unsanitised SQL input in auth/login.ts', sub: 'CRIT · Security · auth/login.ts:47', badge: 'P0' },
          { icon: 'alert', title: 'useEffect missing dependency array', sub: 'HIGH · React · Feed.tsx:112', badge: 'P1' },
          { icon: 'alert', title: 'Blocking sync call in async handler', sub: 'HIGH · Perf · api/handler.ts:28', badge: 'P1' },
          { icon: 'list',  title: 'Function exceeds 80-line threshold', sub: 'MED · Complexity · parser.ts:5', badge: 'P2' },
          { icon: 'list',  title: 'Duplicate string literals (×8)', sub: 'MED · DRY · constants/index.ts:31', badge: 'P2' },
        ]},
      ],
    },
    {
      id: 'coverage',
      label: 'Coverage',
      content: [
        { type: 'metric', label: 'OVERALL COVERAGE', value: '84%', sub: 'Target 85% · Δ +3% this week' },
        { type: 'progress', items: [
          { label: 'Authentication',   pct: 96 },
          { label: 'API Layer',        pct: 88 },
          { label: 'UI Components',    pct: 74 },
          { label: 'State Management', pct: 61 },
          { label: 'Data Parsing',     pct: 43 },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: '✦ Meridian Intelligence', value: 'Updated 4 min ago · 3 actionable suggestions' },
        { type: 'list', items: [
          { icon: 'alert', title: 'SQL injection in 3 endpoints', sub: 'Switch to parameterised queries throughout auth/login.ts, api/search.ts, admin/query.ts', badge: 'P0' },
          { icon: 'zap',   title: 'Sync I/O blocking event loop', sub: 'Replace fs.readFileSync with fs.promises.readFile in api/handler.ts:28', badge: 'P1' },
          { icon: 'eye',   title: 'Data Parsing module under-tested', sub: '43% coverage · ~18 new tests needed for 90% target in utils/parser.ts', badge: 'P2' },
        ]},
        { type: 'tags', label: 'Actions', items: ['Auto-fix P0', 'View diff', 'Generate tests'] },
      ],
    },
    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric', label: '6-WEEK TREND', value: '↑14pts', sub: 'From 78 → 92 · All repositories' },
        { type: 'progress', items: [
          { label: 'W10 Quality Score', pct: 52 },
          { label: 'W11',               pct: 61 },
          { label: 'W12',               pct: 59 },
          { label: 'W13',               pct: 73 },
          { label: 'W14',               pct: 85 },
          { label: 'W15 (this week)',    pct: 100 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Issues Closed', value: '+14' },
          { label: 'Tests Added',   value: '+32' },
          { label: 'Coverage Δ',    value: '+3%' },
        ]},
        { type: 'list', items: [
          { icon: 'code',  title: 'core-api',    sub: 'All repos · code quality', badge: '94/100' },
          { icon: 'code',  title: 'web-client',  sub: 'All repos · code quality', badge: '88/100' },
          { icon: 'code',  title: 'infra-sdk',   sub: 'All repos · code quality', badge: '81/100' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home'   },
    { id: 'issues',    label: 'Issues',    icon: 'alert'  },
    { id: 'coverage',  label: 'Coverage',  icon: 'layers' },
    { id: 'insights',  label: 'Insights',  icon: 'zap'    },
    { id: 'trends',    label: 'Trends',    icon: 'chart'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'apex-mock', 'APEX — Interactive Mock');
console.log('Mock live at:', result.url);
