import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TENOR',
  tagline:   'Deal intelligence for independent consultants',
  archetype: 'deal-management',
  palette: {
    bg:      '#0F1A28',
    surface: '#172035',
    text:    '#E4E8F2',
    accent:  '#4A88C8',
    accent2: '#D4803A',
    muted:   'rgba(228,232,242,0.42)',
  },
  lightPalette: {
    bg:      '#F4F1ED',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#1E3A5F',
    accent2: '#C96B2A',
    muted:   'rgba(26,24,24,0.42)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Month', value: '$28.4K' },
          { label: 'Active Deals', value: '7' },
          { label: 'Win Rate', value: '68%' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Northmoor Capital', sub: 'M&A Strategy · 03 Negotiating', badge: '$18K' },
          { icon: 'check', title: 'Vestal Group', sub: 'Operations · 04 Active', badge: '$24K' },
          { icon: 'activity', title: 'Clearfield Ventures', sub: 'GTM Strategy · 02 Proposal', badge: '$9K' },
        ]},
        { type: 'tags', label: 'Upcoming This Week', items: ['Northmoor call today', 'Clearfield proposal due Wed'] },
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric', label: 'Total Pipeline', value: '$87K', sub: '7 active deals' },
        { type: 'progress', items: [
          { label: '01 Sourced', pct: 100 },
          { label: '02 Proposal', pct: 60 },
          { label: '03 Negotiating', pct: 80 },
          { label: '04 Active', pct: 80 },
          { label: '05 Invoiced', pct: 20 },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Northmoor Capital', sub: 'Stage 03 · 14 days', badge: '$18K' },
          { icon: 'layers', title: 'Alderton & Co.', sub: 'Stage 03 · 6 days', badge: '$24K' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Deal Detail',
      content: [
        { type: 'metric', label: 'Northmoor Capital', value: '$18,000', sub: 'M&A Strategy Advisory · Stage 03' },
        { type: 'progress', items: [
          { label: '01 Sourced · Feb 14', pct: 100 },
          { label: '02 Proposal Sent · Feb 28', pct: 100 },
          { label: '03 Negotiating · Mar 13–', pct: 60 },
          { label: '04 Active · TBD', pct: 0 },
          { label: '05 Invoiced · TBD', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Contract Duration', sub: 'Mar 13 – Jun 13, 2026', badge: '3 mo' },
          { icon: 'zap', title: 'Rate', sub: 'Hourly engagement', badge: '$220/hr' },
          { icon: 'chart', title: 'Est. Hours', sub: '80 hrs projected', badge: '80h' },
        ]},
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Clients', value: '12' },
          { label: 'Active', value: '3' },
          { label: 'Lifetime', value: '$142K' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Northmoor Capital', sub: 'M&A Strategy · Stage 03', badge: '$18K' },
          { icon: 'user', title: 'Vestal Group', sub: 'Operations · Stage 04', badge: '$24K' },
          { icon: 'user', title: 'Clearfield Ventures', sub: 'GTM · Stage 02', badge: '$9K' },
          { icon: 'star', title: 'Alderton & Co.', sub: 'Past client · Completed', badge: '$64K' },
        ]},
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'YTD Revenue', value: '$142,400', sub: '↑ $23.6K vs prior period' },
        { type: 'progress', items: [
          { label: 'Oct 2025', pct: 50 },
          { label: 'Nov 2025', pct: 61 },
          { label: 'Dec 2025', pct: 39 },
          { label: 'Jan 2026', pct: 72 },
          { label: 'Feb 2026', pct: 94 },
          { label: 'Mar 2026', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Northmoor Capital', sub: 'Advisory Retainer · Due Apr 1', badge: '$6K' },
          { icon: 'zap', title: 'Vestal Group', sub: 'Monthly Ops · Due Apr 5', badge: '$8K' },
          { icon: 'alert', title: 'Clearfield Ventures', sub: 'Milestone 1 · Due Apr 15', badge: '$4.5K' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home'     },
    { id: 'pipeline',  label: 'Pipeline', icon: 'layers'   },
    { id: 'detail',    label: 'Deal',     icon: 'activity' },
    { id: 'clients',   label: 'Clients',  icon: 'user'     },
    { id: 'revenue',   label: 'Revenue',  icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'tenor-mock', 'TENOR — Interactive Mock');
console.log('Mock live at:', result.url);
