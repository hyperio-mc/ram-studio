import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HERD',
  tagline:   'Multi-Agent Orchestration OS',
  archetype: 'agent-orchestration',
  palette: {
    bg:      '#09080E',
    surface: '#110F1A',
    text:    '#E4E0F5',
    accent:  '#7B5CFF',
    accent2: '#3DBAFF',
    muted:   'rgba(228,224,245,0.4)',
  },
  lightPalette: {
    bg:      '#F2F0FA',
    surface: '#FFFFFF',
    text:    '#0D0B18',
    accent:  '#6B4CFF',
    accent2: '#2DA8E8',
    muted:   'rgba(13,11,24,0.45)',
  },
  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric', label: 'Fleet Status', value: '72%', sub: '18 of 25 agents active' },
        { type: 'metric-row', items: [
          { label: 'Running', value: '18' },
          { label: 'Idle', value: '5' },
          { label: 'Error', value: '2' },
        ]},
        { type: 'progress', items: [
          { label: 'Customer Onboarding Flow', pct: 70 },
          { label: 'Email Drip Campaign', pct: 45 },
          { label: 'Data Sync Pipeline', pct: 88 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'scout-01', sub: 'Scraping product catalog', badge: 'LIVE' },
          { icon: 'zap', title: 'writer-03', sub: 'Drafting outreach emails', badge: 'LIVE' },
          { icon: 'alert', title: 'outbox-04', sub: 'SMTP timeout — retrying', badge: 'ERR' },
        ]},
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '25' },
          { label: 'Active', value: '18' },
          { label: 'Health', value: '94%' },
        ]},
        { type: 'list', items: [
          { icon: 'search', title: 'scout-01', sub: 'Web Researcher · 142 tasks · 99.2% uptime', badge: 'RUN' },
          { icon: 'zap', title: 'router-01', sub: 'Task Dispatcher · 305 tasks · 99.9%', badge: 'RUN' },
          { icon: 'code', title: 'writer-03', sub: 'Content Generator · 87 tasks', badge: 'RUN' },
          { icon: 'check', title: 'verify-02', sub: 'KYC Validator · 61 tasks · 100%', badge: 'IDL' },
          { icon: 'share', title: 'outbox-04', sub: 'Email Sender · 44 tasks · 89.1%', badge: 'ERR' },
          { icon: 'eye', title: 'audit-01', sub: 'Compliance · 22 tasks · 100%', badge: 'IDL' },
        ]},
      ],
    },
    {
      id: 'flow', label: 'Flow',
      content: [
        { type: 'text', label: 'Active Pipeline', value: 'Customer Onboarding Flow — Step 7 of 12, 4 agents assigned' },
        { type: 'progress', items: [
          { label: 'Trigger → scout-01', pct: 100 },
          { label: 'scout-01 → router-01', pct: 100 },
          { label: 'router-01 → writer-03', pct: 75 },
          { label: 'writer-03 → outbox-04', pct: 30 },
          { label: 'verify-02 → outbox-04', pct: 55 },
        ]},
        { type: 'tags', label: 'Agents in Pipeline', items: ['⚡ Trigger', '🔍 scout-01', '⇢ router-01', '✍ writer-03', '✓ verify-02', '✉ outbox-04'] },
        { type: 'metric-row', items: [
          { label: 'Nodes', value: '6' },
          { label: 'Edges', value: '6' },
          { label: 'Agents', value: '4' },
        ]},
      ],
    },
    {
      id: 'log', label: 'Log',
      content: [
        { type: 'metric-row', items: [
          { label: 'Events / hr', value: '847' },
          { label: 'Errors', value: '2' },
          { label: 'Warnings', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'scout-01 — 09:41:02', sub: 'Scraped 47 records from source', badge: 'OK' },
          { icon: 'zap', title: 'router-01 — 09:41:00', sub: 'Dispatched task batch #1447', badge: 'INFO' },
          { icon: 'check', title: 'writer-03 — 09:40:51', sub: 'Draft ready: Welcome to Acme', badge: 'OK' },
          { icon: 'alert', title: 'outbox-04 — 09:40:44', sub: 'SMTP timeout — retrying (2/3)', badge: 'WARN' },
          { icon: 'check', title: 'verify-02 — 09:40:38', sub: 'KYC passed: user_id 8821', badge: 'OK' },
          { icon: 'alert', title: 'outbox-04 — 09:40:31', sub: 'SMTP connection refused', badge: 'ERR' },
        ]},
      ],
    },
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Tasks Completed', value: '1,847', sub: '↑ 23% vs last 24h · avg 4.2s/task' },
        { type: 'metric-row', items: [
          { label: 'Avg Latency', value: '4.2s' },
          { label: 'Error Rate', value: '0.8%' },
          { label: 'Cost', value: '$3.42' },
        ]},
        { type: 'progress', items: [
          { label: 'router-01 — 305 tasks', pct: 100 },
          { label: 'scout-01 — 142 tasks', pct: 47 },
          { label: 'writer-03 — 87 tasks', pct: 29 },
          { label: 'verify-02 — 61 tasks', pct: 20 },
          { label: 'outbox-04 — 44 tasks', pct: 14 },
        ]},
        { type: 'tags', label: 'Pipeline Status', items: ['Onboarding 70%', 'Email Drip 45%', 'Data Sync 88%', 'KYC Flow 62%'] },
      ],
    },
  ],
  nav: [
    { id: 'command', label: 'Command', icon: 'home' },
    { id: 'agents',  label: 'Agents',  icon: 'user' },
    { id: 'flow',    label: 'Flow',    icon: 'layers' },
    { id: 'log',     label: 'Log',     icon: 'list' },
    { id: 'pulse',   label: 'Pulse',   icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'herd-mock', 'HERD — Interactive Mock');
console.log('Mock live at:', result.url);
