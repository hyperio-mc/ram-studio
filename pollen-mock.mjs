import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'POLLEN',
  tagline:   'Freelance Studio OS',
  archetype: 'freelance-productivity',
  palette: {
    bg:      '#1A1510',
    surface: '#2A221A',
    text:    '#FAF7EC',
    accent:  '#E84B3A',
    accent2: '#F9EAA9',
    muted:   'rgba(250,247,236,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7EC',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#E84B3A',
    accent2: '#6B4CFF',
    muted:   'rgba(26,21,16,0.5)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'This Month', value: '$8,450', sub: '+14% vs last month' },
        { type: 'metric-row', items: [
          { label: 'In Progress', value: '3' },
          { label: 'In Review', value: '2' },
          { label: 'Drafts', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Nova Rebrand System', sub: 'Nova Studio · Due Apr 14', badge: '65%' },
          { icon: 'check', title: 'Campaign Copy', sub: 'Meridian Co. · Due Apr 16', badge: '90%' },
          { icon: 'layers', title: 'App Wireframes', sub: 'Trellis Inc. · Due Apr 22', badge: '20%' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Design', 'Copy', 'Dev', 'Strategy'] },
      ],
    },
    {
      id: 'briefs',
      label: 'Briefs',
      content: [
        { type: 'text', label: 'Active Projects', value: 'Manage all your creative briefs in one place. Track deliverables, progress, and deadlines.' },
        { type: 'progress', items: [
          { label: 'Nova Rebrand System', pct: 65 },
          { label: 'Campaign Copy', pct: 90 },
          { label: 'App Wireframes', pct: 20 },
          { label: 'Brand Photography', pct: 40 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Nova Rebrand', sub: '$4,200 · Apr 14', badge: 'ACTIVE' },
          { icon: 'eye', title: 'Meridian Copy', sub: '$1,800 · Apr 16', badge: 'REVIEW' },
          { icon: 'code', title: 'Trellis Wireframes', sub: '$3,500 · Apr 22', badge: 'DRAFT' },
        ]},
      ],
    },
    {
      id: 'invoices',
      label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Outstanding', value: '$6,200' },
          { label: 'Paid Apr', value: '$8,450' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'INV-0041 · Meridian Co.', sub: '$1,800 · OVERDUE ⚡', badge: '!' },
          { icon: 'share', title: 'INV-0042 · Nova Studio', sub: '$4,200 · Sent', badge: '→' },
          { icon: 'check', title: 'INV-0040 · Bloom Foods', sub: '$2,400 · Paid ✓', badge: '✓' },
          { icon: 'layers', title: 'INV-0039 · Vortex Capital', sub: '$5,600 · Draft', badge: '·' },
        ]},
        { type: 'text', label: 'Tip', value: 'Set up auto-reminders to reduce overdue invoices by up to 40%.' },
      ],
    },
    {
      id: 'new-brief',
      label: 'New Brief',
      content: [
        { type: 'text', label: 'Step 1 of 3', value: 'Fill in your project details to create a structured brief. You can always edit later.' },
        { type: 'metric-row', items: [
          { label: 'Project Type', value: 'Brand' },
          { label: 'Budget Type', value: 'Fixed' },
          { label: 'Duration', value: '3 wks' },
        ]},
        { type: 'tags', label: 'Project Tags', items: ['Design', 'Brand', 'Identity', 'Print'] },
        { type: 'progress', items: [
          { label: 'Form completion', pct: 33 },
        ]},
        { type: 'text', label: 'Smart Fill', value: 'POLLEN auto-suggests rates and timelines based on similar past projects.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Projects Completed', value: '47', sub: 'Since Jan 2024' },
        { type: 'metric-row', items: [
          { label: 'Avg Rate', value: '$95/hr' },
          { label: 'On-time', value: '94%' },
          { label: 'Repeat', value: '68%' },
        ]},
        { type: 'progress', items: [
          { label: 'Design', pct: 55 },
          { label: 'Branding', pct: 25 },
          { label: 'Dev', pct: 20 },
        ]},
        { type: 'tags', label: 'Top Clients', items: ['Nova Studio', 'Meridian', 'Bloom', 'Trellis'] },
        { type: 'text', label: 'Studio Note', value: 'Jade Donovan · Based in Melbourne · Available for new projects' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'briefs', label: 'Briefs', icon: 'list' },
    { id: 'new-brief', label: 'New', icon: 'plus' },
    { id: 'invoices', label: 'Bills', icon: 'chart' },
    { id: 'profile', label: 'You', icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pollen-mock', 'POLLEN — Interactive Mock');
console.log('Mock:', result.status, '→', result.url ?? 'https://ram.zenbin.org/pollen-mock');
