import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ARC',
  tagline:   'AI Agent Orchestration Console',
  archetype: 'agent-orchestration-os',
  palette: {
    bg:      '#0D0C14',
    surface: '#141320',
    text:    '#EBE9FC',
    accent:  '#8B5CF6',
    accent2: '#2DD4BF',
    muted:   'rgba(235,233,252,0.4)',
  },
  lightPalette: {
    bg:      '#F4F3FF',
    surface: '#FFFFFF',
    text:    '#1A1832',
    accent:  '#7C3AED',
    accent2: '#0D9488',
    muted:   'rgba(26,24,50,0.45)',
  },
  screens: [
    {
      id: 'hub', label: 'Hub',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Agents', value: '7' },
          { label: 'Tasks Today',   value: '342' },
          { label: 'Error Rate',    value: '0.3%' },
        ]},
        { type: 'text', label: 'Status', value: '7 agents running across 3 active pipelines. Last pipeline run: 4 minutes ago.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Scout-3',  sub: 'Web crawl complete → 412 pages',       badge: '✓' },
          { icon: 'code',     title: 'Coder-1',  sub: 'PR #291 opened — auth refactor',        badge: '▶' },
          { icon: 'chart',    title: 'Analyst',  sub: 'Q1 summary report generated',           badge: '✓' },
          { icon: 'alert',    title: 'Fetch-2',  sub: 'Rate limited — retrying in 60s',        badge: '!' },
          { icon: 'check',    title: 'Writer-A', sub: 'Article draft published to CMS',        badge: '✓' },
        ]},
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '4' },
          { label: 'Idle',    value: '3' },
          { label: 'Errors',  value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'code',     title: 'Coder-1',  sub: 'Code gen & PR review  •  87 tasks',   badge: '▶' },
          { icon: 'search',   title: 'Scout-3',  sub: 'Web crawl  •  2.1K pages  •  99%',   badge: '▶' },
          { icon: 'chart',    title: 'Analyst',  sub: 'Data analysis  •  12 reports',        badge: '▶' },
          { icon: 'activity', title: 'Fetch-2',  sub: 'API fetch  •  38 queued',             badge: '◎' },
          { icon: 'heart',    title: 'Writer-A', sub: 'Content gen  •  idle',                badge: '–' },
          { icon: 'eye',      title: 'Review-B', sub: 'QA & testing  •  idle',               badge: '–' },
        ]},
      ],
    },
    {
      id: 'graph', label: 'Graph',
      content: [
        { type: 'text', label: 'Pipeline', value: 'Research → Publish  •  7 nodes  •  8 edges' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Trigger',  sub: 'Webhook  •  done',            badge: '✓' },
          { icon: 'search',   title: 'Scout-3',  sub: 'Crawl  •  running',           badge: '▶' },
          { icon: 'activity', title: 'Fetch-2',  sub: 'Fetch  •  waiting (rate)',    badge: '⚠' },
          { icon: 'chart',    title: 'Analyst',  sub: 'Analyze  •  queued',          badge: '◎' },
          { icon: 'heart',    title: 'Writer-A', sub: 'Write  •  queued',            badge: '◎' },
          { icon: 'code',     title: 'Coder-1',  sub: 'Code  •  queued',             badge: '◎' },
          { icon: 'share',    title: 'Output',   sub: 'Publish  •  waiting',         badge: '◎' },
        ]},
        { type: 'progress', items: [
          { label: 'Pipeline Progress', pct: 38 },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Coder-1',
      content: [
        { type: 'metric', label: 'Agent', value: 'Coder-1', sub: 'claude-3-7-sonnet — running' },
        { type: 'metric-row', items: [
          { label: 'Tasks',   value: '87' },
          { label: 'Success', value: '96%' },
          { label: 'Avg Time',value: '2m14s' },
        ]},
        { type: 'progress', items: [
          { label: '#291  Refactor auth module', pct: 65 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '#288', sub: 'Add rate limiting middleware  •  4m ago',  badge: '✓' },
          { icon: 'check', title: '#285', sub: 'Fix CORS headers in gateway  •  18m ago',  badge: '✓' },
          { icon: 'alert', title: '#282', sub: 'DB migration v2→v3  •  1h ago',            badge: '✗' },
          { icon: 'check', title: '#279', sub: 'Set up test coverage  •  2h ago',          badge: '✓' },
        ]},
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Coder-1', 'Scout-3', 'Errors'] },
        { type: 'list', items: [
          { icon: 'activity', title: '09:41:02  Coder-1  INFO',  sub: 'Starting task #291 auth refactor',     badge: '●' },
          { icon: 'code',     title: '09:41:08  Scout-3  INFO',  sub: 'Crawl complete: 412/412 pages',         badge: '●' },
          { icon: 'alert',    title: '09:40:58  Fetch-2  WARN',  sub: 'Rate limit hit — backoff 60s',          badge: '!' },
          { icon: 'activity', title: '09:40:52  Analyst  INFO',  sub: 'Model: claude-3-7-sonnet',             badge: '●' },
          { icon: 'alert',    title: '09:40:36  Fetch-2  ERROR', sub: 'Timeout: api.source.io:443',           badge: '✗' },
          { icon: 'star',     title: '09:40:30  SYSTEM   INFO',  sub: 'Pipeline "Research→Publish" started',  badge: '●' },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Workspace', value: 'Zenbin', sub: 'Pro plan  •  7 agents  •  5 pipelines' },
        { type: 'list', items: [
          { icon: 'code',     title: 'Anthropic Claude',      sub: 'API connected',       badge: '✓' },
          { icon: 'layers',   title: 'GitHub Integration',    sub: 'Active',              badge: '✓' },
          { icon: 'share',    title: 'Slack Webhooks',        sub: 'Active',              badge: '✓' },
          { icon: 'settings', title: 'Default Model',         sub: 'claude-3-7-sonnet',  badge: '›' },
          { icon: 'zap',      title: 'Max Concurrent Agents', sub: '10 agents',           badge: '›' },
          { icon: 'alert',    title: 'Auto-retry on Error',   sub: 'Enabled',             badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'hub',      label: 'Hub',      icon: 'home'     },
    { id: 'agents',   label: 'Agents',   icon: 'activity' },
    { id: 'graph',    label: 'Graph',    icon: 'eye'      },
    { id: 'logs',     label: 'Logs',     icon: 'list'     },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'arc-mock', `${design.appName} — Interactive Mock`);
console.log('Mock live at:', result.url);
