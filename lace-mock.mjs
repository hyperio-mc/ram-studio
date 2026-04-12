import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LACE',
  tagline:   'Creative studio operations, elegantly structured',
  archetype: 'creative-ops',

  palette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#2A4038',
    accent2: '#B87333',
    muted:   'rgba(26,21,16,0.45)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#2A4038',
    accent2: '#B87333',
    muted:   'rgba(26,21,16,0.40)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Studio',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Projects', value: '12' },
          { label: 'Q2 Revenue', value: '$184k' },
          { label: 'Avg Margin', value: '34%' },
        ]},
        { type: 'progress', items: [
          { label: 'Asha K.', pct: 85 },
          { label: 'James L.', pct: 60 },
          { label: 'Mari T.', pct: 95 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Verona Rebrand', sub: 'Due in 3 days · 78% complete', badge: '!' },
          { icon: 'check', title: 'ARIA Campaign', sub: 'Due in 8 days · 45% complete', badge: '✓' },
          { icon: 'star',  title: 'Dunn & Co Website', sub: 'Due in 14 days · 30% complete', badge: '●' },
        ]},
        { type: 'metric', label: 'On Track', value: '9/12', sub: 'projects this quarter' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Delivered', 'Paused'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Verona Rebrand',    sub: '$24,000 · Active · 3d left',   badge: '78%' },
          { icon: 'layers', title: 'ARIA Campaign',     sub: '$18,500 · Active · 8d left',   badge: '45%' },
          { icon: 'layers', title: 'Dunn & Co Website', sub: '$32,000 · Active · 14d left',  badge: '30%' },
          { icon: 'check',  title: 'Holloway Annual',   sub: '$9,800 · Delivered',            badge: '✓' },
          { icon: 'zap',    title: 'Solstice Identity', sub: '$14,200 · Paused · 22d left',  badge: '12%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Value', value: '$99k' },
          { label: 'Delivered', value: '1' },
        ]},
      ],
    },
    {
      id: 'client-report',
      label: 'Clients',
      content: [
        { type: 'metric', label: 'Verona Rebrand', value: '78%', sub: 'Overall progress · 3 days left' },
        { type: 'progress', items: [
          { label: 'Discovery & Brief',   pct: 100 },
          { label: 'Brand Strategy',      pct: 100 },
          { label: 'Logo & Mark Design',  pct: 100 },
          { label: 'Color & Motion',      pct: 55 },
          { label: 'Final Delivery',      pct: 0 },
        ]},
        { type: 'text', label: 'Budget', value: '$18,720 spent of $24,000 budget (78%)' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Approval needed', sub: 'Color palette — 2 options to review', badge: '!' },
          { icon: 'message', title: 'Sofia C.', sub: 'Love option A. Can we try copper on cream?', badge: '2h' },
        ]},
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Team Members', value: '7' },
          { label: 'Over Capacity', value: '2' },
          { label: 'Avg Load', value: '71%' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Asha K. · Creative Dir',   sub: '85% capacity this week',  badge: '85%' },
          { icon: 'user', title: 'James L. · Designer',      sub: '60% capacity this week',  badge: '60%' },
          { icon: 'alert', title: 'Mari T. · Strategist',    sub: '95% — over capacity',     badge: '95%' },
          { icon: 'user', title: 'Oliver H. · Developer',    sub: '45% capacity this week',  badge: '45%' },
          { icon: 'user', title: 'Priya S. · Copywriter',    sub: '72% capacity this week',  badge: '72%' },
        ]},
        { type: 'text', label: 'Alert', value: '2 members over capacity — consider redistributing Verona Rebrand tasks' },
      ],
    },
    {
      id: 'insights',
      label: 'Insight',
      content: [
        { type: 'metric', label: 'Q2 Revenue', value: '$184,200', sub: '+18.4% vs last quarter' },
        { type: 'metric-row', items: [
          { label: 'Utilisation', value: '73%' },
          { label: 'NPS Score', value: '72' },
          { label: 'Best Margin', value: '51%' },
        ]},
        { type: 'progress', items: [
          { label: 'Strategy',   pct: 51 },
          { label: 'Branding',   pct: 42 },
          { label: 'Web Design', pct: 38 },
          { label: 'Print',      pct: 22 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Verona Collective', sub: 'Top client · $48,600 · 3 active briefs', badge: '#1' },
          { icon: 'chart', title: 'Revenue on track', sub: 'Projected $210k by end of Q2', badge: '↑' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'dashboard',    label: 'Studio',    icon: 'grid' },
    { id: 'projects',     label: 'Projects',  icon: 'layers' },
    { id: 'client-report', label: 'Clients',  icon: 'user' },
    { id: 'team',         label: 'Team',      icon: 'activity' },
    { id: 'insights',     label: 'Insight',   icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lace-mock', 'LACE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/lace-mock`);
