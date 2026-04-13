import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DEED',
  tagline:   'Contract Intelligence',
  archetype: 'legal-tech',

  palette: {           // dark theme
    bg:      '#0F1419',
    surface: '#161D27',
    text:    '#E8E4DC',
    accent:  '#4A90D9',
    accent2: '#3DBF7A',
    muted:   'rgba(232,228,220,0.45)',
  },

  lightPalette: {      // light theme — primary
    bg:      '#F8F6F2',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#1D3557',
    accent2: '#2D7D52',
    muted:   'rgba(26,23,20,0.40)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '24' },
          { label: 'Pending', value: '7' },
          { label: 'Expiring', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'SaaS Master Agreement', sub: 'Acorn Tech Inc.', badge: 'Signed' },
          { icon: 'alert', title: 'Freelance NDA', sub: 'Simone Maretti', badge: 'Pending' },
          { icon: 'layers', title: 'Office Lease Renewal', sub: 'Bellview Properties', badge: 'Draft' },
          { icon: 'check', title: 'Employment Contract', sub: 'D. Okonkwo', badge: 'Signed' },
        ]},
        { type: 'text', label: 'Insight', value: '22 of 31 contracts completed this quarter — your fastest period yet.' },
      ],
    },
    {
      id: 'contracts',
      label: 'Contracts',
      content: [
        { type: 'tags', label: 'Filter', items: ['All (31)', 'Signed', 'Pending', 'Draft', 'Expired'] },
        { type: 'list', items: [
          { icon: 'check', title: 'SaaS Master Agreement', sub: 'Acorn Tech · 14 pages', badge: '✓' },
          { icon: 'alert', title: 'Freelance NDA', sub: 'S. Maretti · 3 pages', badge: '!' },
          { icon: 'layers', title: 'Office Lease Renewal', sub: 'Bellview · 22 pages', badge: '—' },
          { icon: 'check', title: 'Vendor SLA', sub: 'Loop Supply · 9 pages', badge: '✓' },
          { icon: 'check', title: 'Employment Contract', sub: 'D. Okonkwo · 6 pages', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'detail',
      label: 'Contract Detail',
      content: [
        { type: 'metric', label: 'SaaS Master Agreement', value: '14', sub: 'pages · Acorn Tech Inc.' },
        { type: 'tags', label: 'Status', items: ['✓ Signed', 'Apr 9, 2025', '2 comments'] },
        { type: 'progress', items: [
          { label: 'Reviewed', pct: 100 },
          { label: 'Identity verified', pct: 100 },
          { label: 'Signed', pct: 100 },
          { label: 'Archived', pct: 80 },
        ]},
        { type: 'text', label: 'Comment', value: 'Section 4.2 needs review before final sign-off. — Marcus W., Legal · Apr 8' },
      ],
    },
    {
      id: 'sign',
      label: 'Signing Flow',
      content: [
        { type: 'metric', label: 'Document', value: 'NDA', sub: 'Freelance · Simone Maretti · 3 pages' },
        { type: 'progress', items: [
          { label: 'Review', pct: 100 },
          { label: 'Identity', pct: 100 },
          { label: 'Sign (current)', pct: 60 },
          { label: 'Confirm', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Alexandra Wren (you)', sub: 'Signed · Apr 9', badge: '✓' },
          { icon: 'user', title: 'Simone Maretti', sub: 'Awaiting signature', badge: '...' },
        ]},
        { type: 'text', label: 'Identity', value: '✓ Verified via Passkey · Sign with confidence.' },
      ],
    },
    {
      id: 'analytics',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '31' },
          { label: 'Done', value: '22' },
          { label: 'Pending', value: '7' },
          { label: 'Expired', value: '2' },
        ]},
        { type: 'metric', label: 'Avg. signing time', value: '2.4d', sub: '↓ 0.6 days vs last period' },
        { type: 'progress', items: [
          { label: 'Oct', pct: 30 },
          { label: 'Nov', pct: 50 },
          { label: 'Dec', pct: 40 },
          { label: 'Jan', pct: 70 },
          { label: 'Feb', pct: 60 },
          { label: 'Mar', pct: 80 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Alexandra signed NDA', sub: 'Apr 9, 2:48pm', badge: '✓' },
          { icon: 'eye', title: 'Simone opened Lease', sub: 'Apr 8, 11:23am', badge: '👁' },
          { icon: 'bell', title: 'Reminder sent to M. Ritter', sub: 'Apr 8, 9:00am', badge: '✉' },
        ]},
      ],
    },
    {
      id: 'templates',
      label: 'Templates',
      content: [
        { type: 'tags', label: 'Category', items: ['All', 'Legal', 'HR', 'Finance', 'Real Estate'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'NDA Standard', sub: 'Legal · 3 pages', badge: '84 uses' },
          { icon: 'user', title: 'Employment Contract', sub: 'HR · 6 pages', badge: '62 uses' },
          { icon: 'star', title: 'SaaS Subscription Agreement', sub: 'Legal · 14 pages', badge: '47 uses' },
          { icon: 'home', title: 'Lease Renewal', sub: 'Real Estate · 22 pages', badge: '31 uses' },
          { icon: 'check', title: 'Independent Contractor', sub: 'HR · 5 pages', badge: '27 uses' },
        ]},
        { type: 'text', label: 'Pro Tip', value: 'Upgrade to DEED Pro for 50+ premium templates and custom clause builder.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard',  label: 'Home',      icon: 'home' },
    { id: 'contracts',  label: 'Contracts', icon: 'layers' },
    { id: 'sign',       label: 'Sign',      icon: 'check' },
    { id: 'analytics',  label: 'Insights',  icon: 'chart' },
    { id: 'templates',  label: 'Templates', icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'deed-mock', 'DEED — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/deed-mock`);
