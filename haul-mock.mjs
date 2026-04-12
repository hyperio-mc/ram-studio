import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HAUL',
  tagline:   'Freelance income & project tracker',
  archetype: 'freelance-finance',

  palette: {            // Dark theme
    bg:      '#1A1208',
    surface: '#251C0E',
    text:    '#F5EDD8',
    accent:  '#FF5C00',
    accent2: '#FFE166',
    muted:   'rgba(245,237,216,0.45)',
  },

  lightPalette: {       // Light neubrutalist theme (primary)
    bg:      '#FDF8F3',
    surface: '#FFFFFF',
    text:    '#111111',
    accent:  '#FF5C00',
    accent2: '#FFE166',
    muted:   'rgba(17,17,17,0.45)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'This Month', value: '$8,450', sub: '↑ 12% vs last month' },
        { type: 'metric-row', items: [
          { label: 'YTD', value: '$29,200' },
          { label: 'Unpaid', value: '$3,100' },
          { label: 'Hours', value: '147h' },
        ]},
        { type: 'text', label: 'Active Projects', value: '3 projects running — Meridian Rebrand, Nova Labs Landing, Flux Brand System' },
        { type: 'list', items: [
          { icon: 'star', title: 'Meridian Rebrand', sub: 'Due Apr 18 · $2,400', badge: 'ACTIVE' },
          { icon: 'eye', title: 'Nova Labs Landing', sub: 'Due Apr 12 · $900', badge: 'REVIEW' },
          { icon: 'layers', title: 'Flux Brand System', sub: 'Due May 3 · $4,200', badge: 'ACTIVE' },
        ]},
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'list', items: [
          { icon: 'star',     title: 'Meridian Rebrand',    sub: 'Meridian Co. · Due Apr 18',   badge: 'ACTIVE' },
          { icon: 'check',    title: 'Nova Labs Landing',   sub: 'Nova Labs · Due Apr 12',       badge: 'REVIEW' },
          { icon: 'layers',   title: 'Flux Brand System',   sub: 'Flux Studio · Due May 3',      badge: 'ACTIVE' },
          { icon: 'grid',     title: 'Parcel Mobile App',   sub: 'Parcel Inc. · Due May 20',     badge: 'ACTIVE' },
          { icon: 'check',    title: 'Ryde Website',        sub: 'Ryde Corp · Completed',        badge: 'DONE' },
        ]},
        { type: 'progress', items: [
          { label: 'Meridian Rebrand', pct: 75 },
          { label: 'Flux Brand System', pct: 25 },
          { label: 'Parcel Mobile App', pct: 40 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Budget', value: '$3,650' },
          { label: 'Active', value: '4' },
          { label: 'Done YTD', value: '12' },
        ]},
      ],
    },
    {
      id: 'timer',
      label: 'Timer',
      content: [
        { type: 'metric', label: 'Current Session', value: '02:14:07', sub: 'Meridian Rebrand · $130/hr' },
        { type: 'metric-row', items: [
          { label: 'Today', value: '5.25h' },
          { label: 'Sessions', value: '3' },
          { label: 'Earned', value: '$682' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Meridian Rebrand',   sub: '9:00 – 11:30 AM',  badge: '2h 30m' },
          { icon: 'activity', title: 'Flux Brand System',  sub: '1:00 – 3:15 PM',   badge: '2h 15m' },
          { icon: 'zap',      title: 'Meridian Rebrand',   sub: '4:30 PM – now',    badge: '▶ live' },
        ]},
        { type: 'text', label: 'Today Total', value: '5.25 hours · $682.50 billed' },
      ],
    },
    {
      id: 'invoices',
      label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Outstanding', value: '$3,100' },
          { label: 'Overdue', value: '$0' },
          { label: 'Paid MTD', value: '$5,350' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: '#047 · Meridian Co.',   sub: 'Apr 8 · $1,200',   badge: 'PAID' },
          { icon: 'share',    title: '#048 · Nova Labs',      sub: 'Apr 10 · $900',    badge: 'SENT' },
          { icon: 'filter',   title: '#049 · Flux Studio',    sub: 'Apr 11 · $2,100',  badge: 'DRAFT' },
          { icon: 'check',    title: '#046 · Parcel Inc.',    sub: 'Mar 28 · $1,600',  badge: 'PAID' },
        ]},
        { type: 'tags', label: 'Filter by', items: ['All', 'Paid', 'Sent', 'Draft', 'Overdue'] },
      ],
    },
    {
      id: 'earnings',
      label: 'Earnings',
      content: [
        { type: 'metric', label: 'Year to Date', value: '$29,200', sub: 'Goal: $80,000 (37% complete)' },
        { type: 'progress', items: [
          { label: 'YTD Goal', pct: 37 },
          { label: 'Jan', pct: 68 },
          { label: 'Feb', pct: 72 },
          { label: 'Mar', pct: 67 },
          { label: 'Apr (current)', pct: 85 },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Parcel Inc.',    sub: '29% of revenue',   badge: '$8,400' },
          { icon: 'layers', title: 'Flux Studio',    sub: '25% of revenue',   badge: '$7,200' },
          { icon: 'grid',   title: 'Meridian Co.',   sub: '23% of revenue',   badge: '$6,600' },
          { icon: 'map',    title: 'Nova Labs',      sub: '16% of revenue',   badge: '$4,800' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Morgan', value: '$130/hr', sub: 'Freelance Product Designer · San Francisco' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Product Design',    sub: '$130/hr · Hourly',       badge: 'Rate' },
          { icon: 'layers',   title: 'Brand Identity',    sub: '$4,500 · Project',       badge: 'Rate' },
          { icon: 'grid',     title: 'Design Systems',    sub: '$8k–$15k · Retainer',    badge: 'Rate' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Projects', value: '12' },
          { label: 'Avg Size', value: '$3,650' },
          { label: 'Util.', value: '73%' },
        ]},
        { type: 'tags', label: 'Settings', items: ['Account', 'Billing', 'Notifications', 'Export'] },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'projects',  label: 'Projects', icon: 'layers' },
    { id: 'timer',     label: 'Timer',    icon: 'activity' },
    { id: 'invoices',  label: 'Invoices', icon: 'list' },
    { id: 'earnings',  label: 'Earn',     icon: 'chart' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'haul');
const result = await publishMock(built, 'haul');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/haul-mock`);
