import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Wire',
  tagline: 'Wire your agents, automate your ops',
  archetype: 'ai-workflow-orchestration',
  palette: {           // dark theme
    bg:      '#0F1410',
    surface: '#161D18',
    text:    '#F0EDE8',
    accent:  '#00C97A',
    accent2: '#7B5CF6',
    muted:   'rgba(240,237,232,0.4)',
  },
  lightPalette: {      // light theme (primary)
    bg:      '#F7F4EE',
    surface: '#FFFFFF',
    text:    '#1A1918',
    accent:  '#00C97A',
    accent2: '#7B5CF6',
    muted:   'rgba(26,25,24,0.45)',
  },
  screens: [
    {
      id: 'flows', label: 'Flows',
      content: [
        { type: 'metric', label: 'Active Flows', value: '6', sub: '2 paused · 1 error' },
        { type: 'metric-row', items: [
          { label: 'Runs today', value: '14' },
          { label: 'Success rate', value: '98.2%' },
          { label: 'Errors', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Customer Onboarding', sub: '3 agents · live 2m ago', badge: '● Live' },
          { icon: 'zap', title: 'Invoice Processing',  sub: '2 agents · live 11m ago',badge: '● Live' },
          { icon: 'zap', title: 'Support Triage',      sub: '4 agents · live 34s ago',badge: '● Live' },
          { icon: 'zap', title: 'Data Sync — EU',      sub: '1 agent · paused 1h ago',badge: '⏸ Paused' },
          { icon: 'alert', title: 'Weekly Report Gen', sub: '2 agents · error 6h ago',badge: '⚠ Error' },
        ]},
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric', label: 'Agent Roster', value: '8', sub: '5 active · 1 error' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Intake',    sub: 'Classifier · claude-3.5 · 3 queued', badge: 'busy' },
          { icon: 'activity', title: 'Drafter',   sub: 'Generator · claude-3.5 · 7 queued',  badge: 'busy' },
          { icon: 'activity', title: 'Verifier',  sub: 'QA · gemini-1.5 · 2 queued',         badge: 'busy' },
          { icon: 'check',    title: 'Sorter',    sub: 'Router · gpt-4o-mini · 0 queued',    badge: 'idle' },
          { icon: 'alert',    title: 'Extractor', sub: 'Parser · claude-3.5 · timeout',      badge: 'error' },
        ]},
        { type: 'progress', items: [
          { label: 'Intake uptime', pct: 100 },
          { label: 'Drafter uptime', pct: 98 },
          { label: 'Extractor uptime', pct: 0 },
        ]},
      ],
    },
    {
      id: 'runs', label: 'Runs',
      content: [
        { type: 'metric', label: 'Live Run Log', value: '5', sub: 'recent executions' },
        { type: 'list', items: [
          { icon: 'play', title: '#8823 · Intake',    sub: 'just now · Classifying inbound msg', badge: 'running' },
          { icon: 'check',title: '#8822 · Drafter',   sub: '1m ago · Generated invoice → Acme',  badge: 'done' },
          { icon: 'check',title: '#8821 · Verifier',  sub: '2m ago · QA passed → tier-2',        badge: 'done' },
          { icon: 'check',title: '#8820 · Notifier',  sub: '4m ago · Email sent → j@acme.co',   badge: 'done' },
          { icon: 'alert',title: '#8819 · Extractor', sub: '1h ago · Timeout: postgres://eu',    badge: 'error' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Running', 'Done', 'Errors'] },
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: 'Total Runs', value: '12,847', sub: '+18% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Success Rate', value: '98.6%' },
          { label: 'Avg Latency', value: '2.4s' },
          { label: 'Active Flows', value: '6' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 58 },
          { label: 'Tue', pct: 72 },
          { label: 'Wed', pct: 65 },
          { label: 'Thu', pct: 88 },
          { label: 'Fri', pct: 95 },
          { label: 'Sat', pct: 84 },
          { label: 'Sun', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Drafter',   sub: '4,201 runs · 3.1s avg', badge: '99.1%' },
          { icon: 'star', title: 'Verifier',  sub: '3,847 runs · 1.8s avg', badge: '99.8%' },
          { icon: 'star', title: 'Intake',    sub: '2,912 runs · 0.9s avg', badge: '97.4%' },
        ]},
      ],
    },
    {
      id: 'config', label: 'Config',
      content: [
        { type: 'text', label: 'Workspace', value: 'Acme Corp · Pro Plan · 8 agents · 50k runs/mo' },
        { type: 'list', items: [
          { icon: 'check',    title: 'Slack',      sub: 'Connected · #wire-ops',   badge: 'on'  },
          { icon: 'check',    title: 'GitHub',     sub: 'Connected · hyperio-mc',  badge: 'on'  },
          { icon: 'lock',     title: 'PostgreSQL', sub: 'Not connected',           badge: 'off' },
          { icon: 'check',    title: 'Zapier',     sub: '3 active zaps',           badge: 'on'  },
        ]},
        { type: 'text', label: 'API Key', value: 'sk-wire-••••••••••••••••••••••••••••••' },
        { type: 'metric', label: 'Danger Zone', value: '⚠', sub: 'Delete workspace — cannot be undone' },
      ],
    },
  ],
  nav: [
    { id: 'flows',     label: 'Flows',     icon: 'zap'      },
    { id: 'agents',    label: 'Agents',    icon: 'layers'   },
    { id: 'runs',      label: 'Runs',      icon: 'play'     },
    { id: 'analytics', label: 'Stats',     icon: 'chart'    },
    { id: 'config',    label: 'Config',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'wire-mock', 'Wire — Interactive Mock');
console.log('Mock live at:', result.url);
