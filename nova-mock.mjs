import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Nova',
  tagline:   'See exactly what your AI agents are doing',
  archetype: 'devops-observability',
  palette: {
    bg:      '#0B0C0F',
    surface: '#141620',
    text:    '#E8EAED',
    accent:  '#6366F1',
    accent2: '#10B981',
    muted:   'rgba(139,143,168,0.45)',
  },
  lightPalette: {
    bg:      '#F4F5F8',
    surface: '#FFFFFF',
    text:    '#0B0C0F',
    accent:  '#6366F1',
    accent2: '#059669',
    muted:   'rgba(11,12,15,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '14' },
          { label: 'Req/s',  value: '2.4K' },
          { label: 'Errors', value: '0.3%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Latency', value: '142ms' },
          { label: 'Tokens',  value: '1.2M' },
          { label: 'Cost/hr', value: '$4.20' },
        ]},
        { type: 'text', label: 'System Health', value: 'All clusters nominal except Gemini 2.0 Flash pool showing elevated latency.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Claude-3.5 Sonnet', sub: 'cluster OK',    badge: 'OK' },
          { icon: 'check', title: 'GPT-4o Turbo',       sub: 'router OK',    badge: 'OK' },
          { icon: 'alert', title: 'Gemini 2.0 Flash',   sub: 'pool degraded',badge: '⚠' },
          { icon: 'check', title: 'Tool executor',       sub: 'service OK',   badge: 'OK' },
        ]},
        { type: 'tags', label: 'Recent Events', items: ['task #2847 done', 'latency spike', '3 sub-agents spawned'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '14' },
          { label: 'Idle',    value: '3' },
          { label: 'Error',   value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'research-alpha',  sub: 'claude-3.5-sonnet · 18.4 rps', badge: 'LIVE' },
          { icon: 'activity', title: 'code-gen-bot',    sub: 'gpt-4o-turbo · 6.2 rps',       badge: 'LIVE' },
          { icon: 'activity', title: 'doc-writer-01',   sub: 'claude-3-haiku · 22.1 rps',    badge: 'LIVE' },
          { icon: 'alert',    title: 'support-ai',      sub: 'gemini-2.0-flash · 890ms p50', badge: 'SLOW' },
          { icon: 'eye',      title: 'data-pipeline',   sub: 'gpt-4o-mini · idle',           badge: 'IDLE' },
          { icon: 'zap',      title: 'email-drafter',   sub: 'claude-3.5-sonnet · timeout',  badge: 'ERR' },
        ]},
      ],
    },
    {
      id: 'traces', label: 'Traces',
      content: [
        { type: 'metric', label: 'Task #2847 — research-alpha', value: '4.2s', sub: '99.2% success rate' },
        { type: 'progress', items: [
          { label: 'plan_task()',   pct: 28 },
          { label: 'web_search()', pct: 49 },
          { label: 'llm_call()',   pct: 100 },
          { label: 'write_file()', pct: 100 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Input',  value: '12.4K' },
          { label: 'Output', value: '4.3K' },
          { label: 'Cache',  value: '2.1K' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'web_search()',  sub: 'arxiv.org query',   badge: '200' },
          { icon: 'check', title: 'read_url()',    sub: 'fetched 3 pages',   badge: '200' },
          { icon: 'check', title: 'llm_call()',    sub: 'claude-3.5-sonnet', badge: '200' },
          { icon: 'check', title: 'write_file()',  sub: 'report.md saved',   badge: '200' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',     value: '2' },
          { label: 'Suppressed', value: '1' },
          { label: 'Rules',      value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'High latency — Gemini Flash', sub: 'p50 > 500ms for 5m · 7 min ago', badge: 'WARN' },
          { icon: 'zap',   title: 'Timeout — email-drafter',     sub: 'No heartbeat 12m · 14 min ago',  badge: 'ERR' },
        ]},
        { type: 'tags', label: 'Active Rules', items: ['Latency SLO', 'Error spike', 'Token budget', 'Heartbeat', 'Cost/req'] },
        { type: 'text', label: 'Suppressed', value: 'Agent heartbeat lost rule is currently suppressed during maintenance window.' },
      ],
    },
    {
      id: 'usage', label: 'Usage',
      content: [
        { type: 'metric', label: 'Monthly Budget', value: '$312.40', sub: 'of $500.00 · 62.5% used' },
        { type: 'progress', items: [
          { label: 'claude-3.5-sonnet · $148.20', pct: 47 },
          { label: 'gpt-4o-turbo · $88.40',       pct: 28 },
          { label: 'gemini-2.0-flash · $44.10',   pct: 14 },
          { label: 'gpt-4o-mini · $31.70',        pct: 10 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Input',  value: '18.4M' },
          { label: 'Output', value: '6.2M' },
          { label: 'Total',  value: '28.7M' },
        ]},
        { type: 'text', label: 'Trend', value: 'Daily spend averaging $11.20/day. On track to stay under monthly budget.' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'agents',   label: 'Agents',   icon: 'activity' },
    { id: 'traces',   label: 'Traces',   icon: 'layers' },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell' },
    { id: 'usage',    label: 'Usage',    icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'nova-mock', 'Nova — Interactive Mock');
console.log('Mock live at:', result.url);
