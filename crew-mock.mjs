import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Crew',
  tagline:   'Hire agents. Set goals. Ship work.',
  archetype: 'ai-workforce-platform',
  palette: {
    bg:      '#0D0F14',
    surface: '#12151D',
    text:    '#E2E8F0',
    accent:  '#06B6D4',
    accent2: '#10B981',
    muted:   'rgba(148,163,184,0.45)',
  },
  lightPalette: {
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#059669',
    muted:   'rgba(15,23,42,0.4)',
  },
  screens: [
    {
      id: 'workforce', label: 'Workforce',
      content: [
        { type: 'metric-row', items: [
          { label: 'Agents',  value: '12' },
          { label: 'Tasks',   value: '47' },
          { label: 'Quality', value: '94%' },
          { label: 'Cost/Day', value: '$128' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Alex — Research Analyst',  sub: 'claude-3.5 · Market Analysis Q2 · 78%', badge: 'LIVE' },
          { icon: 'activity', title: 'Maya — Writer',            sub: 'gpt-4o · Blog post: AI trends · 92%',   badge: 'LIVE' },
          { icon: 'alert',    title: 'Kai — Analyst',            sub: 'claude-3.5 · Competitor brief · 45%',  badge: 'REV' },
          { icon: 'eye',      title: 'Sam — Developer',          sub: 'deepseek · idle',                       badge: 'IDLE' },
          { icon: 'activity', title: 'Rae — Email',              sub: 'gpt-4o-mini · Outreach seq #4 · 61%', badge: 'LIVE' },
          { icon: 'activity', title: 'Dex — Research',           sub: 'claude-3-haiku · Industry report · 88%', badge: 'LIVE' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['Hire Agent', 'New Task', 'Review Queue', 'Analytics'] },
      ],
    },
    {
      id: 'agent-profile', label: 'Agent',
      content: [
        { type: 'metric', label: 'Alex-Research-01', value: '94%', sub: 'Quality score · 186 tasks completed · $0.34/task' },
        { type: 'metric-row', items: [
          { label: 'Tasks Done', value: '186' },
          { label: 'Avg Speed',  value: '8.2m' },
          { label: 'Per Task',   value: '$0.34' },
        ]},
        { type: 'text', label: 'Current Assignment', value: 'Market Analysis Q2 2026 — 78% complete. Due Apr 12. 12 web searches, 4 docs analyzed.' },
        { type: 'tags', label: 'Permissions', items: ['Web Search ✓', 'Read Files ✓', 'API Calls ✓', 'Email ✗', 'Code ✗'] },
        { type: 'list', items: [
          { icon: 'check', title: 'SaaS Market Deep Dive',    sub: 'Apr 7 · Analysis',  badge: '97' },
          { icon: 'check', title: 'Competitor Landscape EU',  sub: 'Apr 5 · Report',    badge: '93' },
          { icon: 'check', title: 'Q1 Research Summary',      sub: 'Apr 2 · Doc',       badge: '89' },
        ]},
      ],
    },
    {
      id: 'tasks', label: 'Tasks',
      content: [
        { type: 'metric-row', items: [
          { label: 'Queued',   value: '8' },
          { label: 'Running',  value: '14' },
          { label: 'Review',   value: '6' },
          { label: 'Approved', value: '19' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Market Analysis Q2',    sub: 'Alex · Research · HIGH',     badge: 'RUN' },
          { icon: 'activity', title: 'Blog post: AI 2026',    sub: 'Maya · Writing · HIGH',      badge: 'RUN' },
          { icon: 'alert',    title: 'Competitor brief',      sub: 'Kai · Analysis · REVIEW',    badge: 'REV' },
          { icon: 'activity', title: 'Outreach seq #4',       sub: 'Rae · Email · MED',          badge: 'RUN' },
          { icon: 'eye',      title: 'Social media audit',    sub: 'Sam · Analysis · QUEUED',    badge: 'Q:2' },
          { icon: 'eye',      title: 'Privacy policy update', sub: 'Maya · Doc · QUEUED',        badge: 'Q:5' },
        ]},
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'metric', label: 'Market Analysis Q2 2026', value: '94', sub: 'AI Confidence Score · Assigned by Rakis' },
        { type: 'text', label: 'Alex-Research-01 Note', value: '"Found 3 major competitors not in prior list. EU market sizing revised up 23%. High confidence all sources verified."' },
        { type: 'text', label: 'Deliverable Preview', value: 'The enterprise SaaS analytics market grew 34% YoY to $8.4B in Q1 2026. Three new entrants identified: DataSphere ($180M ARR), MetricFlow (open source, 12K stars), PulseIQ (AI-native, $40M raised). EU market revised from €2.1B to €2.59B (+23%).' },
        { type: 'tags', label: 'Actions', items: ['✓ Approve', '↻ Revise', '✗ Reject'] },
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: 'Tasks Completed (30D)', value: '1,247', sub: '+18.4% vs prior period' },
        { type: 'progress', items: [
          { label: 'Rae — Email (best performer)', pct: 100 },
          { label: 'Alex — Research',               pct: 94 },
          { label: 'Maya — Writer',                 pct: 92 },
          { label: 'Dex — Research',                pct: 91 },
          { label: 'Kai — Analyst',                 pct: 89 },
          { label: 'Sam — Developer',               pct: 87 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Research', value: '$498' },
          { label: 'Writing',  value: '$314' },
          { label: 'Analysis', value: '$249' },
          { label: 'Dev',      value: '$249' },
        ]},
      ],
    },
    {
      id: 'hire', label: 'Hire',
      content: [
        { type: 'text', label: 'New Agent Configuration', value: 'Name: Alex-Research-03 · Role: Research Analyst · Model: claude-3.5-sonnet (Recommended) · Max 3 concurrent tasks' },
        { type: 'tags', label: 'Role', items: ['Researcher', 'Writer', 'Analyst', 'Developer', 'Email', 'Custom'] },
        { type: 'list', items: [
          { icon: 'check', title: 'claude-3.5-sonnet',  sub: 'Best quality · 4K context · recommended', badge: 'PRO' },
          { icon: 'eye',   title: 'gpt-4o',             sub: 'Balanced quality + speed',                badge: '' },
          { icon: 'eye',   title: 'claude-3-haiku',     sub: 'Fast & cost-efficient',                   badge: 'FAST' },
        ]},
        { type: 'tags', label: 'Permissions', items: ['Web Search ON', 'Read Files ON', 'API Calls ON', 'Email OFF', 'Code OFF'] },
      ],
    },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'crew');
const result = await publishMock(built, 'crew');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/crew-mock`);
