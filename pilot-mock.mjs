import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PILOT',
  tagline:   'your agents, in formation.',
  archetype: 'agent-fleet-manager',
  palette: {
    bg:      '#1A1714',
    surface: '#242018',
    text:    '#F5F1EB',
    accent:  '#2D5BFF',
    accent2: '#FF4F1A',
    muted:   'rgba(245,241,235,0.45)',
  },
  lightPalette: {
    bg:      '#F5F1EB',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#2D5BFF',
    accent2: '#FF4F1A',
    muted:   'rgba(26,23,20,0.45)',
  },
  screens: [
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'metric-row', items: [{ label: 'Agents', value: '6' }, { label: 'Running', value: '23' }, { label: 'Done Today', value: '847' }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Scout', sub: 'Web Research · 12 tasks · 2h 14m', badge: '●' },
          { icon: 'code',    title: 'Forge', sub: 'Code Gen · 8 tasks · 45m', badge: '●' },
          { icon: 'message', title: 'Herald', sub: 'Email · paused · —', badge: '‖' },
          { icon: 'chart',   title: 'Ledger', sub: 'Data Pipeline · 31 tasks · 6h 02m', badge: '●' },
          { icon: 'lock',    title: 'Cipher', sub: 'Security · standby · —', badge: '○' },
        ]},
      ],
    },
    {
      id: 'agent', label: 'Agent',
      content: [
        { type: 'metric', label: 'Scout — Web Research', value: '98.2%', sub: 'Success rate · 847 tasks completed' },
        { type: 'progress', items: [
          { label: 'Scrape competitor pricing', pct: 65 },
        ]},
        { type: 'metric-row', items: [{ label: 'Tasks Done', value: '847' }, { label: 'Uptime', value: '2h 14m' }, { label: 'Model', value: 'GPT-4o' }] },
        { type: 'list', items: [
          { icon: 'eye',    title: '09:41 · Navigating asana.com/pricing', sub: 'In progress', badge: '→' },
          { icon: 'check',  title: '09:38 · Extracted 12 points from linear.app', sub: 'Success', badge: '✓' },
          { icon: 'eye',    title: '09:35 · Opened Notion pricing page', sub: 'Complete', badge: '✓' },
          { icon: 'zap',    title: '09:31 · Task assigned by Orchestrator', sub: 'System', badge: '⚡' },
        ]},
      ],
    },
    {
      id: 'tasks', label: 'Tasks',
      content: [
        { type: 'metric-row', items: [{ label: 'Total', value: '7' }, { label: 'Running', value: '3' }, { label: 'Queued', value: '2' }] },
        { type: 'tags', label: 'Filter', items: ['All', 'Running', 'Queued', 'Done'] },
        { type: 'list', items: [
          { icon: 'search', title: 'Scout · Research AI pricing trends', sub: 'running · High priority · ~12m', badge: '▶' },
          { icon: 'code',   title: 'Forge · Generate TypeScript types', sub: 'running · High priority · ~4m', badge: '▶' },
          { icon: 'chart',  title: 'Ledger · Sync Stripe webhooks', sub: 'running · Med · ~2m', badge: '▶' },
          { icon: 'search', title: 'Scout · Scrape ProductHunt top 50', sub: 'queued · Med · —', badge: '⏳' },
          { icon: 'message',title: 'Herald · Draft cold outreach', sub: 'paused · Low · —', badge: '‖' },
          { icon: 'lock',   title: 'Cipher · OWASP scan staging', sub: 'pending · Med · —', badge: '○' },
        ]},
      ],
    },
    {
      id: 'outcomes', label: 'Results',
      content: [
        { type: 'metric', label: 'Tasks Completed Today', value: '847', sub: '+33% vs yesterday (634)' },
        { type: 'progress', items: [
          { label: 'Research (Scout)', pct: 37 },
          { label: 'Code gen (Forge)', pct: 27 },
          { label: 'Data sync (Ledger)', pct: 22 },
          { label: 'Outreach (Herald)', pct: 10 },
          { label: 'Security (Cipher)', pct: 4 },
        ]},
        { type: 'list', items: [
          { icon: 'search', title: 'Scout found 6 competitor price changes', sub: 'Notion raised pricing by 20%', badge: '↓' },
          { icon: 'code',   title: 'Forge wrote 1,240 lines of TypeScript', sub: 'Completed in 3.2 minutes', badge: '✓' },
          { icon: 'message',title: 'Herald queued 42 personalised emails', sub: '78% predicted open rate', badge: '✉' },
        ]},
      ],
    },
    {
      id: 'deploy', label: 'Deploy',
      content: [
        { type: 'text', label: 'Agent Name', value: 'Phantom — your next agent' },
        { type: 'tags', label: 'Model', items: ['GPT-4o ✓', 'Claude 3.5', 'Gemini Pro', 'Mistral'] },
        { type: 'tags', label: 'Tools', items: ['Web Browse ✓', 'Code Exec ✓', 'Email', 'Postgres', 'File I/O ✓', 'Slack', 'GitHub'] },
        { type: 'text', label: 'Schedule', value: 'Every 2 hours · Est. $0.08/day · ~4 credits/run' },
        { type: 'metric', label: 'Ready to Deploy', value: 'Phantom', sub: 'GPT-4o · Web Browse + Code Exec + File I/O' },
      ],
    },
  ],
  nav: [
    { id: 'fleet',    label: 'Fleet',   icon: 'home' },
    { id: 'tasks',    label: 'Tasks',   icon: 'list' },
    { id: 'outcomes', label: 'Results', icon: 'chart' },
    { id: 'deploy',   label: 'Deploy',  icon: 'plus' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pilot-mock', 'PILOT — Interactive Mock');
console.log('Mock live at:', result.url);
