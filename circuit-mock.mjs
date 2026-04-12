import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CIRCUIT',
  tagline:   'Infrastructure topology, decoded',
  archetype: 'devops-monitor',
  palette: {
    bg:      '#0A0C10',
    surface: '#111318',
    text:    '#E2E8F0',
    accent:  '#00FF87',
    accent2: '#38BDF8',
    muted:   'rgba(139,158,183,0.45)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#059669',
    accent2: '#0284C7',
    muted:   'rgba(13,17,23,0.45)',
  },
  screens: [
    {
      id: 'topology', label: 'Topology',
      content: [
        { type: 'metric-row', items: [
          { label: 'NODES', value: '24' },
          { label: 'EDGES', value: '38' },
          { label: 'ISSUES', value: '2' },
        ]},
        { type: 'text', label: '// PRODUCTION CLUSTER — us-east-1', value: 'API-GW → AUTH · USER · DATA → REDIS · JWT · CACHE · PG-R · PG-W → S3 · CDN' },
        { type: 'metric-row', items: [
          { label: 'UPTIME', value: '99.98%' },
          { label: 'P50 LAT', value: '12ms' },
          { label: 'RPS', value: '2.4k' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'API-GW v2.3.1', sub: 'us-east-1 · healthy', badge: 'OK' },
          { icon: 'alert', title: 'USER-SVC v3.1.2', sub: 'p99 latency 312ms', badge: 'WARN' },
          { icon: 'alert', title: 'PG-WRITER v1.0.9', sub: 'connection refused', badge: 'ERR' },
        ]},
        { type: 'progress', items: [
          { label: 'Cluster health', pct: 87 },
          { label: 'Traffic handled', pct: 99 },
        ]},
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric', label: 'ACTIVE DEPLOY', value: 'a3f82d1', sub: 'main · rakis@hyperio.io · 14m ago' },
        { type: 'list', items: [
          { icon: 'check', title: '01 BUILD', sub: '2m 14s · passed 847 tests', badge: 'DONE' },
          { icon: 'check', title: '02 TEST', sub: '4m 02s · coverage 94.2%', badge: 'DONE' },
          { icon: 'check', title: '03 STAGING', sub: '1m 55s · smoke tests OK', badge: 'DONE' },
          { icon: 'activity', title: '04 CANARY', sub: '1% traffic → v2.3.1', badge: 'RUN' },
          { icon: 'eye', title: '05 PROD', sub: 'awaiting approval', badge: 'WAIT' },
        ]},
        { type: 'tags', label: 'DEPLOY OPTIONS', items: ['ROLLING', 'CANARY', 'BLUE-GREEN'] },
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'HEALTHY', value: '21' },
          { label: 'WARN', value: '1' },
          { label: 'CRIT', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway', sub: 'CPU 28% · P50 11ms · 2.4k RPS', badge: 'OK' },
          { icon: 'alert', title: 'user-service', sub: 'CPU 71% · P50 38ms · 1.1k RPS', badge: 'WARN' },
          { icon: 'alert', title: 'cache-layer', sub: 'CPU 83% · MEM 79% · evicting', badge: 'WARN' },
          { icon: 'alert', title: 'pg-writer', sub: 'CPU 99% · connection refused', badge: 'ERR' },
          { icon: 'check', title: 'cdn-router', sub: 'CPU 22% · P50 2ms · 12k RPS', badge: 'OK' },
        ]},
        { type: 'progress', items: [
          { label: 'pg-writer CPU', pct: 99 },
          { label: 'cache-layer MEM', pct: 79 },
          { label: 'api-gateway CPU', pct: 28 },
        ]},
      ],
    },
    {
      id: 'console', label: 'Console',
      content: [
        { type: 'tags', label: 'LOG LEVEL FILTER', items: ['ALL', 'ERR', 'WARN', 'INFO'] },
        { type: 'list', items: [
          { icon: 'alert', title: '09:41:38 ERR pg-writer', sub: 'connection refused: dial tcp :5432', badge: 'ERR' },
          { icon: 'alert', title: '09:41:38 WARN cache-layer', sub: 'eviction rate high: 83% mem', badge: 'WRN' },
          { icon: 'activity', title: '09:41:36 INFO api-gateway', sub: 'GET /v2/users 200 11ms [2.4k/s]', badge: 'OK' },
          { icon: 'alert', title: '09:41:36 ERR pg-writer', sub: 'health check failed (attempt 7)', badge: 'ERR' },
          { icon: 'activity', title: '09:41:34 INFO cdn-router', sub: 'cache HIT ratio 94.7% nominal', badge: 'OK' },
        ]},
        { type: 'text', label: '> FILTER COMMAND', value: '> filter svc:pg-writer lvl:ERR' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'CRITICAL', value: '2' },
          { label: 'WARNING', value: '1' },
          { label: 'RESOLVED 24H', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'INC-2847 CRIT pg-writer', sub: 'PostgreSQL writer connection failure · 3m ago', badge: 'CRIT' },
          { icon: 'alert', title: 'INC-2846 CRIT pg-writer', sub: 'WAL sender disconnected · 6m ago', badge: 'CRIT' },
          { icon: 'alert', title: 'INC-2843 WARN cache-layer', sub: 'Memory >80% threshold · 18m ago', badge: 'WARN' },
        ]},
        { type: 'tags', label: 'ACTIONS', items: ['ESCALATE', 'SILENCE', 'RUNBOOK', 'ROLLBACK'] },
        { type: 'progress', items: [
          { label: 'INC-2847 duration', pct: 95 },
          { label: 'INC-2843 duration', pct: 30 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'topology', label: 'Topo',    icon: 'layers' },
    { id: 'pipeline', label: 'Pipe',    icon: 'play' },
    { id: 'services', label: 'Svcs',    icon: 'grid' },
    { id: 'console',  label: 'Log',     icon: 'list' },
    { id: 'alerts',   label: 'Alerts',  icon: 'alert' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'circuit-mock', 'CIRCUIT — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/circuit-mock`);
