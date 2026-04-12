import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Rally',
  tagline:   'Your humans and agents, in sync',
  archetype: 'productivity-ai-light',

  palette: {           // DARK theme
    bg:      '#1A1720',
    surface: '#221F2A',
    text:    '#F4F1ED',
    accent:  '#8B6FFF',
    accent2: '#4ECB8E',
    muted:   'rgba(244,241,237,0.4)',
  },
  lightPalette: {      // LIGHT theme (primary)
    bg:      '#F4F3EF',
    surface: '#FFFFFF',
    text:    '#1A1918',
    accent:  '#6D4AFF',
    accent2: '#1EA97C',
    muted:   'rgba(26,25,24,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Hours Saved This Week', value: '127h', sub: 'By your 5 active agents' },
        { type: 'metric-row', items: [
          { label: 'Agents Active', value: '5' },
          { label: 'In Review', value: '12' },
          { label: 'Done Today', value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Aria', sub: 'Drafting Q1 release notes · 73%', badge: 'Active' },
          { icon: 'activity', title: 'Rex', sub: 'Triaging support tickets · 51%', badge: 'Active' },
          { icon: 'check', title: 'Nova', sub: 'PR #1047 Review — needs approval', badge: 'Review' },
        ]},
        { type: 'text', label: 'Ready to review', value: 'Nova completed: PR #1047 Review · Confidence 94% · 3 min ago' },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric', label: 'Fleet Status', value: '5 / 7', sub: 'agents currently working' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Aria — Content Agent', sub: 'Drafting Q1 release notes · GPT-4o · 142 tasks', badge: '73%' },
          { icon: 'zap', title: 'Rex — Support Agent', sub: 'Triaging 18 tickets · Claude 3 · 318 tasks', badge: '51%' },
          { icon: 'eye', title: 'Nova — Code Review', sub: 'PR #1047 complete — awaiting review', badge: '✓' },
          { icon: 'chart', title: 'Dex — Data Agent', sub: 'Building conversion report · GPT-4o', badge: '38%' },
          { icon: 'user', title: 'Sage — Research', sub: 'No tasks assigned — idle', badge: 'Idle' },
        ]},
        { type: 'progress', items: [
          { label: 'Aria', pct: 73 },
          { label: 'Rex', pct: 51 },
          { label: 'Dex', pct: 38 },
        ]},
      ],
    },
    {
      id: 'queue', label: 'Queue',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Open', value: '24' },
          { label: 'AI Tasks', value: '18' },
          { label: 'Human Tasks', value: '6' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Fix auth token expiry bug', sub: 'Rex · 88% confidence · 2h old', badge: 'AI' },
          { icon: 'zap', title: 'Write onboarding email copy', sub: 'Aria · 92% confidence · 4h old', badge: 'AI' },
          { icon: 'user', title: 'Review Q1 OKR doc', sub: 'Unassigned · 1 day old', badge: 'Human' },
          { icon: 'zap', title: 'Migrate legacy DB endpoints', sub: 'Dex · 76% confidence · 6h old', badge: 'AI' },
          { icon: 'user', title: 'Design audit — landing page', sub: 'Unassigned · 2 days old', badge: 'Human' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'AI Assigned', 'Human', 'Blocked', 'High Priority'] },
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'metric', label: 'Pending Reviews', value: '12', sub: '3 agents waiting on approval' },
        { type: 'list', items: [
          { icon: 'code', title: 'Nova — PR #1047 Review', sub: '284 lines · 6 files · 94% confidence', badge: '94%' },
          { icon: 'check', title: 'Aria — Q1 Release Notes', sub: '1,200 words · Tone matched · 91%', badge: '91%' },
          { icon: 'list', title: 'Rex — Ticket Triage #18', sub: '18 tickets categorised · 88% conf', badge: '88%' },
        ]},
        { type: 'text', label: 'Unlocks downstream', value: 'Reviewing these 3 items unblocks 8 downstream tasks currently waiting in queue.' },
        { type: 'progress', items: [
          { label: 'Nova confidence', pct: 94 },
          { label: 'Aria confidence', pct: 91 },
          { label: 'Rex confidence', pct: 88 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Hours Saved — 30 days', value: '127h', sub: 'Equivalent to 15.9 full work days' },
        { type: 'metric-row', items: [
          { label: 'Completion', value: '94%' },
          { label: 'Avg Confidence', value: '89%' },
          { label: 'Tasks / Agent', value: '12.4' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Rex', sub: '318 tasks · 9.4/10 · Support', badge: '#1' },
          { icon: 'star', title: 'Aria', sub: '142 tasks · 9.1/10 · Content', badge: '#2' },
          { icon: 'star', title: 'Dex', sub: '204 tasks · 8.7/10 · Data', badge: '#3' },
          { icon: 'star', title: 'Nova', sub: '87 tasks · 8.2/10 · Code Review', badge: '#4' },
        ]},
        { type: 'progress', items: [
          { label: 'Human reviews reduced', pct: 69 },
          { label: 'Task completion rate', pct: 94 },
          { label: 'On-time delivery', pct: 87 },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'home',    label: 'Home',    icon: 'home'     },
    { id: 'agents',  label: 'Agents',  icon: 'activity' },
    { id: 'queue',   label: 'Queue',   icon: 'list'     },
    { id: 'review',  label: 'Review',  icon: 'eye'      },
    { id: 'insights',label: 'Insights',icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'rally-mock',
});
const result = await publishMock(html, 'rally-mock', 'Rally — Interactive Mock');
console.log('Mock live at:', result.url);
