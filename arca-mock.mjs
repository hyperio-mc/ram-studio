import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ARCA',
  tagline:   'Agent Run Control & Analytics',
  archetype: 'agent-observability',
  palette: {
    bg:      '#1A1714',
    surface: '#242018',
    text:    '#F4F1EC',
    accent:  '#4D7EFF',
    accent2: '#3EC970',
    muted:   'rgba(244,241,236,0.4)',
  },
  lightPalette: {
    bg:      '#F4F1EC',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#2254C8',
    accent2: '#2B8A3E',
    muted:   'rgba(26,23,20,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Active Runs', value: '12', sub: '↑ 3 from 1h ago' },
        { type: 'metric-row', items: [
          { label: 'Avg Latency', value: '1.4s' },
          { label: 'Success', value: '97%' },
          { label: 'Errors', value: '4' },
        ]},
        { type: 'text', label: 'Pipeline Activity', value: 'Tool calls today: 14,830 executions — ↑ 18% vs yesterday' },
        { type: 'list', items: [
          { icon: 'check', title: 'ARK-00841 · ResearchBot', sub: '8 steps · 1.2s', badge: 'DONE' },
          { icon: 'activity', title: 'ARK-00840 · CodeReview', sub: '12 steps · running', badge: 'RUN' },
          { icon: 'alert', title: 'ARK-00839 · DataSync', sub: '5 steps · 0.8s', badge: 'ERR' },
        ]},
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric', label: 'ARK-00841 · ResearchBot', value: '1.2s', sub: '6 steps completed' },
        { type: 'list', items: [
          { icon: 'code',   title: '01 — PLAN',      sub: 'think() · 0.09s',       badge: '✓' },
          { icon: 'search', title: '02 — SEARCH',    sub: 'web_search() · 0.24s',  badge: '✓' },
          { icon: 'eye',    title: '03 — FETCH',     sub: 'read_url() · 0.31s',    badge: '✓' },
          { icon: 'zap',    title: '04 — SUMMARIZE', sub: 'llm_call() · 0.38s',    badge: '✓' },
          { icon: 'check',  title: '05 — VERIFY',    sub: 'fact_check() · 0.12s',  badge: '✓' },
          { icon: 'layers', title: '06 — FORMAT',    sub: 'render_md() · 0.06s',   badge: '✓' },
        ]},
      ],
    },
    {
      id: 'tools', label: 'Tools',
      content: [
        { type: 'metric', label: 'Tool Registry', value: '8', sub: 'tools in use today' },
        { type: 'progress', items: [
          { label: 'web_search()  · 4,210 calls', pct: 98 },
          { label: 'llm_call()    · 3,840 calls', pct: 96 },
          { label: 'read_url()    · 2,991 calls', pct: 94 },
          { label: 'write_file()  · 1,720 calls', pct: 99 },
          { label: 'code_exec()   · 1,204 calls', pct: 87 },
          { label: 'send_email()  · 890 calls',   pct: 99 },
          { label: 'db_query()    · 753 calls',   pct: 91 },
          { label: 'fact_check()  · 420 calls',   pct: 95 },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Open Alerts', value: '3', sub: '2 WARN · 1 HIGH' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Rate Limit Exceeded',  sub: 'web_search() · 429 × 14 · 2m ago',  badge: '🔴' },
          { icon: 'alert', title: 'Latency Spike',        sub: 'llm_call() · 4.8s avg · 11m ago',   badge: '🟡' },
          { icon: 'alert', title: 'Token Budget at 94%',  sub: 'ARK-00836 · 94k/100k · 34m ago',    badge: '🟡' },
        ]},
        { type: 'tags', label: 'Resolved Today', items: ['ALT-006 Memory', 'ALT-005 Auth', 'ALT-004 Timeout'] },
      ],
    },
    {
      id: 'agent', label: 'Agent',
      content: [
        { type: 'metric', label: 'AGT-001 · ResearchBot', value: '97.3%', sub: 'success rate across 481 runs' },
        { type: 'metric-row', items: [
          { label: 'Avg Steps',  value: '7.2' },
          { label: 'P95 Lat',   value: '2.1s' },
          { label: 'Errors',    value: '4' },
        ]},
        { type: 'progress', items: [
          { label: 'web_search()  44% of calls', pct: 44 },
          { label: 'llm_call()    31% of calls', pct: 31 },
          { label: 'fact_check()  14% of calls', pct: 14 },
          { label: 'read_url()    11% of calls', pct: 11 },
        ]},
        { type: 'text', label: 'Stack', value: 'GPT-4o · web_search + read_url + fact_check · avg 6,240 tokens/run' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Home',    icon: 'home' },
    { id: 'pipeline', label: 'Flows',   icon: 'activity' },
    { id: 'tools',    label: 'Tools',   icon: 'layers' },
    { id: 'alerts',   label: 'Alerts',  icon: 'bell' },
    { id: 'agent',    label: 'Agent',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'arca-mock',
});
const result = await publishMock(html, 'arca-mock', 'ARCA — Interactive Mock');
console.log('Mock live at:', result.url);
