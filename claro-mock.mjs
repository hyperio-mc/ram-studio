import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Claro',
  tagline:   'Financial clarity for independent minds',
  archetype: 'finance-productivity',
  palette: {           // dark fallback
    bg:      '#1A1210',
    surface: '#231918',
    text:    '#F8F5F0',
    accent:  '#C4622D',
    accent2: '#3D6B57',
    muted:   'rgba(248,245,240,0.42)',
  },
  lightPalette: {      // primary — editorial light
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#1A1210',
    accent:  '#C4622D',
    accent2: '#3D6B57',
    muted:   'rgba(26,18,16,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Earned · 2025', value: '$84,320', sub: '↑ 22% vs 2024 · On track' },
        { type: 'metric-row', items: [
          { label: 'Clients', value: '12' },
          { label: 'Outstanding', value: '$3.1K' },
          { label: 'On-time', value: '94%' },
        ]},
        { type: 'text', label: 'Monthly Goal', value: '$7,240 of $9,000 goal — 80% complete' },
        { type: 'list', items: [
          { icon: 'check', title: 'Acme Corp', sub: 'Invoice paid · Mar 27', badge: '+$4,200' },
          { icon: 'calendar', title: 'Bloom Studio', sub: 'Invoice pending · Due Apr 10', badge: 'Pending' },
          { icon: 'alert', title: 'North Labs', sub: 'Overdue 14 days · $1,200', badge: 'Overdue' },
        ]},
        { type: 'text', label: 'Claro Insight', value: 'You earn 34% more in Q1 — consider booking highest-ticket clients now.' },
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'Annual Revenue · 2025', value: '$84,320', sub: 'Best month: Sep · $9,200' },
        { type: 'metric-row', items: [
          { label: 'Avg monthly', value: '$7,027' },
          { label: 'vs last yr', value: '+22%' },
          { label: 'Best Q', value: 'Q3' },
        ]},
        { type: 'progress', items: [
          { label: 'Consulting (52%)', pct: 52 },
          { label: 'Retainer clients (28%)', pct: 28 },
          { label: 'One-off projects (13%)', pct: 13 },
          { label: 'Product sales (7%)', pct: 7 },
        ]},
        { type: 'tags', label: 'Revenue Streams', items: ['Consulting', 'Retainer', 'Projects', 'Products'] },
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'metric', label: 'Client Portfolio', value: '12 active', sub: '$84,320 total lifetime value' },
        { type: 'metric-row', items: [
          { label: 'On time', value: '8' },
          { label: 'Invoiced', value: '3' },
          { label: 'Overdue', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Acme Corp', sub: 'Retainer · Since 2023', badge: '$43,200' },
          { icon: 'user', title: 'Bloom Studio', sub: 'Active · Since 2024', badge: '$18,450' },
          { icon: 'alert', title: 'North Labs', sub: 'Overdue · Since 2024', badge: '$12,800' },
          { icon: 'user', title: 'Veritas Group', sub: 'Active · Since 2025', badge: '$9,640' },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric', label: 'Outstanding', value: '$3,050', sub: '2 invoices need attention' },
        { type: 'metric-row', items: [
          { label: 'Pending', value: '1' },
          { label: 'Overdue', value: '1' },
          { label: 'Paid (Mar)', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: '#0142 · Bloom Studio', sub: 'Due Apr 10', badge: '$1,850' },
          { icon: 'alert', title: '#0141 · North Labs', sub: 'Overdue Mar 14', badge: '$1,200' },
          { icon: 'check', title: '#0140 · Acme Corp', sub: 'Paid Mar 27', badge: '$4,200' },
          { icon: 'check', title: '#0139 · Veritas Group', sub: 'Paid Mar 18', badge: '$2,100' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '82 / 100', sub: 'Good · Updated today by Claro AI' },
        { type: 'metric-row', items: [
          { label: 'Runway', value: '4.2 mo' },
          { label: 'Proj. Q2', value: '$22,800' },
          { label: 'Day rate', value: '$680' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Best earning window', sub: '34% more revenue in Jan–Mar', badge: '↑ Act' },
          { icon: 'alert', title: 'Concentration risk', sub: 'Acme Corp = 51% of revenue', badge: '⚠ Risk' },
          { icon: 'chart', title: 'Rate opportunity', sub: 'Day rate 14% below market', badge: '$ Raise' },
        ]},
        { type: 'text', label: 'Recommended action', value: 'Book one new retainer client before May to reduce concentration risk and hit your $100K goal.' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'revenue',  label: 'Revenue',  icon: 'chart' },
    { id: 'clients',  label: 'Clients',  icon: 'user' },
    { id: 'invoices', label: 'Invoices', icon: 'list' },
    { id: 'insights', label: 'Insights', icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'claro-mock', 'Claro — Interactive Mock');
console.log('Mock live at:', result.url);
