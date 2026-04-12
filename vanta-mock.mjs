import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'VANTA',
  tagline: 'AI model control room',
  archetype: 'developer-tools',
  palette: {
    bg:      '#0E0D0C',
    surface: '#1C1A18',
    text:    '#F0EDE6',
    accent:  '#C8FF00',
    accent2: '#5B4EFF',
    muted:   'rgba(240,237,230,0.38)',
  },
  lightPalette: {
    bg:      '#F5F4F2',
    surface: '#FFFFFF',
    text:    '#1A1816',
    accent:  '#5B8A00',
    accent2: '#5B4EFF',
    muted:   'rgba(26,24,22,0.45)',
  },
  screens: [
    {
      id: 'discovery',
      label: 'Discovery',
      content: [
        { type: 'metric', label: 'ACTIVE MODELS', value: '17', sub: 'Across 6 providers' },
        { type: 'metric-row', items: [
          { label: 'Tokens/week', value: '28.4B' },
          { label: 'Avg latency', value: '1.2ms' },
          { label: 'Uptime', value: '99.9%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'claude-3-7-sonnet', sub: 'Anthropic · TEXT · 94.2 bench', badge: '✓ ACTIVE' },
          { icon: 'activity', title: 'gpt-4o', sub: 'OpenAI · TEXT · 91.8 bench', badge: 'STANDBY' },
          { icon: 'zap', title: 'gemini-2.0-flash', sub: 'Google DeepMind · MULTI · 89.1', badge: '↗ RISING' },
          { icon: 'layers', title: 'llama-3.3-70b', sub: 'Meta · TEXT · OPEN · 87.3 bench', badge: '' },
        ]},
        { type: 'tags', label: 'CATEGORIES', items: ['All', 'Text', 'Vision', 'Code', 'Embed', 'Speech'] },
      ],
    },
    {
      id: 'detail',
      label: 'Model Detail',
      content: [
        { type: 'metric', label: 'OVERALL BENCHMARK', value: '94.2', sub: 'claude-3-7-sonnet · Anthropic' },
        { type: 'metric-row', items: [
          { label: 'Latency', value: '1.2ms' },
          { label: 'Context', value: '128K' },
          { label: 'Cost/1M in', value: '$3.00' },
          { label: 'Daily tokens', value: '4.2B' },
        ]},
        { type: 'progress', items: [
          { label: 'MMLU', pct: 88 },
          { label: 'HumanEval', pct: 92 },
          { label: 'MATH', pct: 97 },
          { label: 'BIG-Bench', pct: 91 },
          { label: 'HellaSwag', pct: 96 },
        ]},
        { type: 'text', label: 'CAPABILITIES', value: 'Extended thinking, tool use, vision, 128K context window. Ideal for complex reasoning, coding, and multi-step agentic tasks.' },
      ],
    },
    {
      id: 'compare',
      label: 'Compare',
      content: [
        { type: 'text', label: 'COMPARING', value: 'claude-3-7-sonnet vs gpt-4o — 5/7 metrics won by Claude' },
        { type: 'list', items: [
          { icon: 'check', title: 'Benchmark', sub: 'claude 94.2 vs gpt 91.8', badge: '◈ Wins' },
          { icon: 'check', title: 'MMLU', sub: 'claude 88.4 vs gpt 87.2', badge: '◈ Wins' },
          { icon: 'check', title: 'HumanEval', sub: 'claude 92.0 vs gpt 90.2', badge: '◈ Wins' },
          { icon: 'activity', title: 'Latency', sub: 'claude 1.2ms vs gpt 0.8ms', badge: 'GPT Wins' },
          { icon: 'activity', title: 'Cost/1M', sub: 'claude $3.00 vs gpt $2.50', badge: 'GPT Wins' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Claude score', value: '94.2' },
          { label: 'GPT-4o score', value: '91.8' },
        ]},
      ],
    },
    {
      id: 'deploy',
      label: 'Deploy',
      content: [
        { type: 'text', label: 'DEPLOYING', value: 'claude-3-7-sonnet → prod-assistant-v2 endpoint on Production' },
        { type: 'metric-row', items: [
          { label: 'Environment', value: 'Prod' },
          { label: 'Max tokens', value: '4096' },
          { label: 'Rate limit', value: '1k/min' },
        ]},
        { type: 'tags', label: 'CONFIG', items: ['Production', 'Monitoring ON', 'Failover: gpt-4o', '128K ctx'] },
        { type: 'text', label: 'ENDPOINT', value: 'api.vanta.dev/v1/prod-assistant-v2 · Ready to deploy' },
      ],
    },
    {
      id: 'usage',
      label: 'Usage',
      content: [
        { type: 'metric', label: 'TOKENS THIS WEEK', value: '28.4B', sub: '↑ 8.2% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Cost this week', value: '$847' },
          { label: 'Active models', value: '3' },
          { label: 'Avg latency', value: '1.1ms' },
        ]},
        { type: 'progress', items: [
          { label: 'claude-3-7-sonnet', pct: 50 },
          { label: 'gpt-4o', pct: 28 },
          { label: 'gemini-flash', pct: 17 },
          { label: 'llama-3.3-70b', pct: 5 },
        ]},
        { type: 'tags', label: 'TIME RANGE', items: ['24h', '7d (active)', '30d', 'Custom'] },
      ],
    },
  ],
  nav: [
    { id: 'discovery', label: 'Models', icon: 'layers' },
    { id: 'compare',   label: 'Compare', icon: 'eye' },
    { id: 'deploy',    label: 'Deploy', icon: 'zap' },
    { id: 'usage',     label: 'Usage', icon: 'chart' },
    { id: 'detail',    label: 'Detail', icon: 'search' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vanta-mock', 'VANTA — Interactive Mock');
console.log('Mock live at:', result.url);
