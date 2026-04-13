import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SURGE',
  tagline:   'Every API call, accounted for',
  archetype: 'developer-tool',

  palette: {
    bg:      '#070A0F',
    surface: '#0D1117',
    text:    '#E2EAF4',
    accent:  '#00D4FF',
    accent2: '#FF5240',
    muted:   'rgba(123,143,166,0.45)',
  },

  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#0099BB',
    accent2: '#E03020',
    muted:   'rgba(13,17,23,0.4)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Command Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Requests', value: '48.3M' },
          { label: 'Error Rate', value: '0.12%' },
          { label: 'P99 Latency', value: '186ms' },
        ]},
        { type: 'metric', label: 'System Uptime', value: '99.97%', sub: '30-day rolling average' },
        { type: 'progress', items: [
          { label: 'P99 Latency vs target (≤200ms)', pct: 93 },
          { label: 'Monthly budget used ($2,847/$4k)', pct: 71 },
          { label: 'Overall system health', pct: 98 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: '/v2/inference', sub: '2,340 req/s · 42ms P99', badge: '0.08%' },
          { icon: 'zap',     title: '/v1/embeddings', sub: '890 req/s · 18ms P99', badge: '0.21%' },
          { icon: 'alert',   title: '/v2/chat/stream', sub: '450 req/s · 238ms P99', badge: '1.40%' },
        ]},
      ],
    },
    {
      id: 'endpoints',
      label: 'Endpoints',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'v2', 'v1', 'Slow', 'Errors'] },
        { type: 'list', items: [
          { icon: 'code',     title: 'POST /v2/inference', sub: '42ms · 2,340 RPS', badge: '✓' },
          { icon: 'code',     title: 'POST /v1/embeddings', sub: '18ms · 890 RPS', badge: '✓' },
          { icon: 'alert',    title: 'GET /v2/chat/stream', sub: '238ms · 450 RPS', badge: '1.4%' },
          { icon: 'code',     title: 'POST /v2/completions', sub: '190ms · 320 RPS', badge: '✓' },
          { icon: 'check',    title: 'GET /v1/models', sub: '8ms · 210 RPS', badge: '✓' },
          { icon: 'alert',    title: 'POST /v2/fine-tune', sub: '4.2s · 12 RPS', badge: '3.1%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Endpoints', value: '14' },
          { label: 'Healthy', value: '11' },
          { label: 'Degraded', value: '3' },
        ]},
      ],
    },
    {
      id: 'incidents',
      label: 'Incidents',
      content: [
        { type: 'metric', label: '⚡ Active Incident — P1', value: '23m', sub: 'Elevated error rate on /v2/chat/stream (1.4%, threshold 0.5%)' },
        { type: 'progress', items: [
          { label: 'Error rate vs threshold', pct: 28 },
        ]},
        { type: 'text', label: 'Timeline', value: '09:18 — Automated detection triggered\n09:20 — PagerDuty alert sent to @kai\n09:31 — Incident channel opened\n09:41 — Investigation in progress' },
        { type: 'list', items: [
          { icon: 'check', title: 'Inc-2844: Latency spike /v1/embeddings', sub: 'Resolved in 14m · 2h ago', badge: 'P2' },
          { icon: 'check', title: 'Inc-2843: 5xx errors — auth service', sub: 'Resolved in 6m · 5h ago', badge: 'P2' },
          { icon: 'check', title: 'Inc-2842: Rate limit breach — enterprise', sub: 'Resolved in 2m · 9h ago', badge: 'P3' },
        ]},
      ],
    },
    {
      id: 'usage',
      label: 'Usage & Cost',
      content: [
        { type: 'metric', label: 'Total Spend (MTD)', value: '$2,847', sub: 'of $4,000 budget · $3,640 projected' },
        { type: 'progress', items: [
          { label: 'gpt-4o ($1,480 · 52%)', pct: 52 },
          { label: 'claude-sonnet ($769 · 27%)', pct: 27 },
          { label: 'gemini-1.5-pro ($398 · 14%)', pct: 14 },
          { label: 'gpt-3.5-turbo ($200 · 7%)', pct: 7 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Daily Avg', value: '$237' },
          { label: 'Peak Day', value: '$312' },
          { label: 'Saved', value: '$180' },
        ]},
        { type: 'tags', label: 'Period', items: ['Day', 'Week', 'Month', 'Year'] },
      ],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      content: [
        { type: 'list', items: [
          { icon: 'check', title: 'OpenAI', sub: 'GPT-4o + Embeddings · 28.4M calls', badge: '●' },
          { icon: 'check', title: 'Anthropic', sub: 'Claude 3.5 Sonnet · 12.1M calls', badge: '●' },
          { icon: 'alert', title: 'Google AI', sub: 'Gemini 1.5 Pro · 4.8M calls', badge: '~' },
        ]},
        { type: 'text', label: 'Available', value: 'AWS Bedrock, Azure OpenAI, Cohere, Mistral, Together AI — all ready to connect' },
        { type: 'metric-row', items: [
          { label: 'Connected', value: '3' },
          { label: 'Available', value: '8' },
          { label: 'Webhooks', value: '5' },
        ]},
        { type: 'tags', label: 'Providers', items: ['LLM', 'Vector DB', 'Cache', 'Gateway'] },
      ],
    },
  ],

  nav: [
    { id: 'overview',     label: 'Overview',    icon: 'home' },
    { id: 'endpoints',    label: 'Endpoints',   icon: 'list' },
    { id: 'incidents',    label: 'Incidents',   icon: 'alert' },
    { id: 'usage',        label: 'Usage',       icon: 'chart' },
    { id: 'integrations', label: 'Connect',     icon: 'layers' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'surge-mock', 'SURGE — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/surge-mock');
