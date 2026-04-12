import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BRUME',
  tagline:   'Your creative studio, at rest',
  archetype: 'studio-workspace',

  palette: {          // dark theme
    bg:      '#1A1512',
    surface: '#231E1A',
    text:    '#F0E8DF',
    accent:  '#C75D3A',
    accent2: '#4B7BAB',
    muted:   'rgba(240,232,223,0.42)',
  },
  lightPalette: {     // warm cream — primary theme
    bg:      '#F8F4EE',
    surface: '#FFFFFF',
    text:    '#1D1916',
    accent:  '#C75D3A',
    accent2: '#4B7BAB',
    muted:   'rgba(29,25,22,0.45)',
  },

  screens: [
    {
      id: 'studio',
      label: 'Studio Hub',
      content: [
        { type: 'metric', label: 'Good morning, Mia', value: 'Tuesday', sub: 'April 8, 2026' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '7' },
          { label: 'Pending', value: '$12.4k' },
          { label: 'Hours', value: '142h' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Arktide Rebrand', sub: 'Due Apr 14 · 72% complete', badge: 'Active' },
          { icon: 'layers',   title: 'Nova App UI',    sub: 'Due Apr 22 · 45% complete', badge: 'Active' },
          { icon: 'star',     title: 'Sundry Campaign',sub: 'Due May 3 · 28% complete',  badge: 'Active' },
        ]},
        { type: 'text', label: 'Today\'s Focus', value: 'Review brand mockups, send Nova invoice, client call at 3pm.' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric', label: 'Active Projects', value: '7', sub: '3 on hold · 14 completed this year' },
        { type: 'list', items: [
          { icon: 'grid',     title: 'Arktide Rebrand',    sub: 'Arktide Co. · $8,500 budget',  badge: '72%' },
          { icon: 'code',     title: 'Nova App UI',        sub: 'Nova Health · $14,200 budget', badge: '45%' },
          { icon: 'zap',      title: 'Sundry Campaign',    sub: 'Sundry Foods · $6,000 budget', badge: '28%' },
          { icon: 'eye',      title: 'Morten Annual Report',sub: 'Morten Group · $4,800 budget',badge: '91%' },
        ]},
        { type: 'progress', items: [
          { label: 'Arktide Rebrand', pct: 72 },
          { label: 'Nova App UI',     pct: 45 },
          { label: 'Sundry Campaign', pct: 28 },
          { label: 'Morten Report',   pct: 91 },
        ]},
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      content: [
        { type: 'metric', label: 'Studio Clients', value: '12', sub: '5 active · 3 prospects' },
        { type: 'list', items: [
          { icon: 'star',   title: 'Morten Group',   sub: 'Lea Morten · 3 projects · $31.4k', badge: 'VIP' },
          { icon: 'user',   title: 'Arktide Co.',    sub: 'James Park · 2 projects · $18.2k', badge: '⬤' },
          { icon: 'heart',  title: 'Nova Health',    sub: 'Sarah Chen · 1 project · $14.2k',  badge: '⬤' },
          { icon: 'check',  title: 'Sundry Foods',   sub: 'Tom Reeves · 1 project · $6k',     badge: '⬤' },
          { icon: 'search', title: 'Halcyon Studio', sub: 'Priya Nair · 0 projects',           badge: 'New' },
        ]},
        { type: 'tags', label: 'Industries', items: ['Branding','Product','Editorial','Campaign','Health'] },
      ],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: [
        { type: 'metric', label: 'Today · April 8', value: '6h', sub: 'tracked across 4 projects' },
        { type: 'list', items: [
          { icon: 'message', title: '9:00 — Morning standup',  sub: 'Arktide Rebrand · 30 min', badge: 'mtg' },
          { icon: 'grid',    title: '10:30 — Logo exploration',sub: 'Arktide Rebrand · 2h',     badge: 'design' },
          { icon: 'message', title: '13:00 — Client call',     sub: 'Nova Health · 1h',         badge: 'mtg' },
          { icon: 'eye',     title: '14:30 — Wireframes review',sub:'Nova Health · 1.5h',       badge: 'design' },
          { icon: 'filter',  title: '16:30 — Invoice prep',    sub: 'Sundry Foods · 45 min',    badge: 'admin' },
        ]},
        { type: 'progress', items: [
          { label: 'Design hours', pct: 68 },
          { label: 'Meetings',     pct: 22 },
          { label: 'Admin',        pct: 10 },
        ]},
      ],
    },
    {
      id: 'finances',
      label: 'Finances',
      content: [
        { type: 'metric', label: 'Monthly Revenue', value: '$21,400', sub: '↑ 18% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Invoiced', value: '$28.2k' },
          { label: 'Received', value: '$21.4k' },
          { label: 'Overdue',  value: '$2.8k' },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'INV-024 · Morten Group', sub: '$4,800 · Apr 1',   badge: 'Paid' },
          { icon: 'share',  title: 'INV-025 · Arktide Co.',  sub: '$3,200 · Apr 5',   badge: 'Sent' },
          { icon: 'layers', title: 'INV-026 · Nova Health',  sub: '$6,000 · Apr 8',   badge: 'Draft' },
          { icon: 'alert',  title: 'INV-023 · Halcyon',      sub: '$2,800 · Mar 22',  badge: 'Due' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Studio Performance', value: 'April', sub: 'Monthly overview' },
        { type: 'metric-row', items: [
          { label: 'Utilisation', value: '78%' },
          { label: 'Retention',   value: '91%' },
          { label: 'Avg Value',   value: '$9.2k' },
        ]},
        { type: 'progress', items: [
          { label: 'Utilisation',     pct: 78 },
          { label: 'Client Retention',pct: 91 },
          { label: 'Invoice Recovery',pct: 76 },
          { label: 'Revenue Growth',  pct: 82 },
        ]},
        { type: 'text', label: 'Studio Note', value: '"A quiet month builds a loud quarter." — RAM' },
        { type: 'tags', label: 'Strong Areas', items: ['Retention','Revenue','Utilisation'] },
      ],
    },
  ],

  nav: [
    { id: 'studio',   label: 'Studio',   icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'grid' },
    { id: 'clients',  label: 'Clients',  icon: 'user' },
    { id: 'timeline', label: 'Timeline', icon: 'calendar' },
    { id: 'finances', label: 'Finances', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'brume-mock', 'BRUME — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/brume-mock');
