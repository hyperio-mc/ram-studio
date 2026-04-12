import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ORBIT',
  tagline:   'Mission control for autonomous agents.',
  archetype: 'productivity',
  palette: {
    bg:      '#0D0D10',
    surface: '#16161C',
    text:    '#EEEAF8',
    accent:  '#7B6EF6',
    accent2: '#34C8A0',
    muted:   'rgba(238,234,248,0.40)',
  },
  lightPalette: {
    bg:      '#F5F4FF',
    surface: '#FFFFFF',
    text:    '#1A1830',
    accent:  '#5B4FD4',
    accent2: '#1EA882',
    muted:   'rgba(26,24,48,0.45)',
  },
  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric', label: 'FLEET STATUS', value: '12 online', sub: '3 running · 1 alert · 97.6% success rate today' },
        { type: 'metric-row', items: [
          { label: 'RUNNING',  value: '3'   },
          { label: 'QUEUED',   value: '5'   },
          { label: 'DONE TODAY', value: '41' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'ORB-0144 — Pricing analysis', sub: '4 agents · 78% · 4m 22s', badge: '▶ LIVE' },
          { icon: 'activity', title: 'ORB-0143 — Churn prediction', sub: '6 agents · 42% · 2m 01s', badge: '▶ LIVE' },
          { icon: 'activity', title: 'ORB-0142 — API regression', sub: '2 agents · 95% · 7m 44s', badge: '▶ LIVE' },
          { icon: 'check',    title: 'ORB-0141 — Legal clause scan', sub: '8 agents · 2m 18s', badge: '✓ DONE' },
          { icon: 'alert',    title: 'ORB-0139 — Data ingestion', sub: 'Max retries exceeded', badge: '⚠ FAIL' },
        ]},
        { type: 'progress', items: [
          { label: 'Throughput +18% vs 7d avg', pct: 82 },
        ]},
        { type: 'tags', label: 'Filter', items: ['All · 49', 'Running · 3', 'Queued · 5', 'Error · 1'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric', label: 'AGENT FLEET', value: '16 total', sub: '12 online · 3 standby · 1 error' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Aria-7  ·  GPT-4o Research',       sub: '28 tasks · running',  badge: '● LIVE' },
          { icon: 'activity', title: 'Bolt-3  ·  Claude-3.7 Analysis',   sub: '41 tasks · running',  badge: '● LIVE' },
          { icon: 'activity', title: 'Core-9  ·  Gemini 2.0 Synthesis',  sub: '17 tasks · running',  badge: '● LIVE' },
          { icon: 'activity', title: 'Halo-6  ·  Gemini 2.5 Planning',   sub: '9 tasks · running',   badge: '● LIVE' },
          { icon: 'eye',      title: 'Dusk-2  ·  GPT-4o Drafting',       sub: '0 tasks · standby',   badge: '◌ IDLE' },
          { icon: 'alert',    title: 'Flux-1  ·  GPT-4o-mini Routing',   sub: 'ERROR · 3 failed',    badge: '✗ ERR'  },
        ]},
        { type: 'tags', label: 'Model', items: ['All', 'GPT-4o · 6', 'Claude · 5', 'Gemini · 3', 'Mini · 2'] },
      ],
    },
    {
      id: 'run-detail', label: 'Run Detail',
      content: [
        { type: 'metric', label: 'ORB-0144 · PRICING ANALYSIS', value: '78% done', sub: 'Started 4m 22s ago · 4 agents · GPT-4o · Est. 38s left' },
        { type: 'progress', items: [
          { label: 'Aria-7  · Salesforce pricing', pct: 92 },
          { label: 'Bolt-3  · HubSpot & Intercom', pct: 81 },
          { label: 'Core-9  · Zendesk vs Freshdesk', pct: 71 },
          { label: 'Dusk-2  · Linear vs Shortcut', pct: 68 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Run initialized',     sub: 'Provisioned 4 agents from pool',        badge: '4m 22s' },
          { icon: 'check', title: 'Context injected',    sub: 'Task brief + web search enabled',       badge: '4m 18s' },
          { icon: 'check', title: 'Aria-7 milestone',    sub: 'Salesforce plan grid extracted · 14 rows', badge: '3m 41s' },
          { icon: 'check', title: 'Bolt-3 milestone',    sub: 'HubSpot pricing ingested · 3 tiers',   badge: '2m 09s' },
          { icon: 'zap',   title: 'Synthesis in progress', sub: 'Core-9 + Dusk-2 comparing…',         badge: 'now' },
        ]},
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric', label: 'PIPELINE', value: '13 total', sub: '3 running · 5 queued · 2 paused · 3 done today' },
        { type: 'metric-row', items: [
          { label: 'RUNNING', value: '3' },
          { label: 'QUEUED',  value: '5' },
          { label: 'PAUSED',  value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'ORB-0144 — Pricing analysis',       sub: '4 agents · 78%',          badge: '▶ LIVE' },
          { icon: 'activity', title: 'ORB-0143 — Churn prediction',       sub: '6 agents · 42%',          badge: '▶ LIVE' },
          { icon: 'calendar', title: 'ORB-0145 — Earnings transcript',    sub: '8 agents · est 3m',       badge: '◷ NEXT' },
          { icon: 'calendar', title: 'ORB-0146 — Support categories',     sub: '3 agents · est 1m',       badge: '◷ WAIT' },
          { icon: 'calendar', title: 'ORB-0147 — SEO gap analysis',       sub: '5 agents · est 7m',       badge: '◷ WAIT' },
          { icon: 'alert',    title: 'ORB-0139 — Data ingestion',         sub: 'Error · waiting on review', badge: '⏸ HOLD' },
        ]},
        { type: 'tags', label: 'View', items: ['All · 13', 'Live · 3', 'Queued · 5', 'Paused · 2'] },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'SIGNALS', value: '1 critical', sub: '3 warnings · 12 info · last 24h' },
        { type: 'list', items: [
          { icon: 'alert',  title: 'Flux-1 crashed',          sub: 'Max retries exceeded — removed from pool', badge: '⚠ HIGH' },
          { icon: 'alert',  title: 'Token budget 80%',        sub: 'ORB-0143 · reduce scope or increase limit', badge: '◎ MED' },
          { icon: 'alert',  title: 'Run timeout approaching', sub: 'ORB-0142 · est completion in 38s',          badge: '◎ MED' },
          { icon: 'check',  title: 'New agent deployed',      sub: 'Jett-2 (Claude-3.7 Extract) added to fleet', badge: '● INFO' },
          { icon: 'chart',  title: 'Throughput spike +18%',   sub: 'Above 7-day baseline · all systems nominal', badge: '● INFO' },
          { icon: 'star',   title: 'Daily digest ready',      sub: '41 runs · avg 2m 31s · 97.6% success',      badge: '● INFO' },
        ]},
        { type: 'tags', label: 'Severity', items: ['All', 'Critical · 1', 'Warning · 3', 'Info · 12'] },
      ],
    },
  ],
  nav: [
    { id: 'command',    label: 'Control',  icon: 'grid' },
    { id: 'agents',     label: 'Agents',   icon: 'activity' },
    { id: 'run-detail', label: 'Detail',   icon: 'zap' },
    { id: 'pipeline',   label: 'Pipeline', icon: 'list' },
    { id: 'signals',    label: 'Signals',  icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'orbit-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
