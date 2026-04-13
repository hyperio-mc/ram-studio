import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TINE',
  tagline:   'Freelance time, tracked honestly',
  archetype: 'freelance-tools',

  palette: {           // dark theme
    bg:      '#1A1C18',
    surface: '#222620',
    text:    '#E8E6E0',
    accent:  '#6BB88A',
    accent2: '#D4A445',
    muted:   'rgba(232,230,224,0.4)',
  },

  lightPalette: {      // light theme — the primary design
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#2B5C3A',
    accent2: '#8C6515',
    muted:   'rgba(28,25,22,0.42)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Running timer', value: '02:47:33', sub: 'Oramund — Brand Identity' },
        { type: 'metric-row', items: [
          { label: 'Billable', value: '4h 12m' },
          { label: 'Earnings', value: '£ 672' },
          { label: 'Non-bill', value: '1h 08m' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Wireframes review', sub: 'Oramund  ·  1h 32m', badge: '£ 184' },
          { icon: 'activity', title: 'Type spec doc', sub: 'Vellum Press  ·  48m', badge: '£ 72' },
          { icon: 'activity', title: 'Client call', sub: 'Oramund  ·  52m', badge: '—' },
          { icon: 'activity', title: 'Asset export', sub: 'Vellum Press  ·  1h 00m', badge: '£ 120' },
        ]},
        { type: 'text', label: 'Invoice due soon', value: 'Vellum Press INV-0040 · £ 1,680 due Apr 15' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '6' },
          { label: 'Tracked', value: '£ 12,440' },
          { label: 'This month', value: '£ 5,040' },
        ]},
        { type: 'progress', items: [
          { label: 'Oramund Brand Identity  · £ 3,360', pct: 70 },
          { label: 'Tidewater App UI  · £ 6,240',       pct: 87 },
          { label: 'Vellum Press Type  · £ 1,680',      pct: 70 },
          { label: 'Kessler Annual Report  · £ 960',    pct: 100 },
        ]},
        { type: 'tags', label: 'Status', items: ['Active', 'Invoiced', 'Archived'] },
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'metric', label: 'Week total', value: '8h 11m', sub: 'Oramund — £ 748 billable' },
        { type: 'list', items: [
          { icon: 'check', title: 'Logo concepts v3', sub: 'Fri 09:00–12:00  ·  3h 00m', badge: '£' },
          { icon: 'check', title: 'Client email responses', sub: 'Fri 13:30–14:34  ·  1h 04m', badge: '—' },
          { icon: 'check', title: 'Spec sheet export', sub: 'Fri 16:00–16:48  ·  48m', badge: '£' },
          { icon: 'check', title: 'Wireframe review call', sub: 'Sat 10:00–11:32  ·  1h 32m', badge: '£' },
          { icon: 'check', title: 'Revision notes doc', sub: 'Sat 14:15–15:57  ·  1h 42m', badge: '—' },
        ]},
        { type: 'progress', items: [
          { label: 'Design work', pct: 61 },
          { label: 'Client comms', pct: 22 },
          { label: 'Admin',        pct: 17 },
        ]},
      ],
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: [
        { type: 'metric', label: 'Invoice #INV-0041', value: '£ 3,744', sub: 'Oramund Ltd  ·  Due Apr 26 2026' },
        { type: 'list', items: [
          { icon: 'list', title: 'Logo Concepts v1–v3', sub: '12h  ·  £ 120/hr', badge: '£ 1,440' },
          { icon: 'list', title: 'Brand Guidelines', sub: '8h  ·  £ 120/hr', badge: '£ 960' },
          { icon: 'list', title: 'Wireframe Reviews', sub: '4h  ·  £ 120/hr', badge: '£ 480' },
          { icon: 'list', title: 'Export & Handoff', sub: '2h  ·  £ 120/hr', badge: '£ 240' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Subtotal', value: '£ 3,120' },
          { label: 'VAT 20%',  value: '£ 624' },
          { label: 'Total',    value: '£ 3,744' },
        ]},
        { type: 'text', label: 'Payment', value: 'Bank: NatWest  ·  Sort 60-40-12  ·  Acc 88223344' },
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      content: [
        { type: 'metric-row', items: [
          { label: 'Clients', value: '4' },
          { label: 'Lifetime', value: '£ 48.2K' },
          { label: 'Active', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Oramund Ltd', sub: 'Branding  ·  £ 120/hr  ·  £ 14,400 total', badge: '✓' },
          { icon: 'user', title: 'Vellum Press', sub: 'Editorial  ·  £ 90/hr  ·  £ 7,200 total', badge: '✓' },
          { icon: 'user', title: 'Tidewater Co', sub: 'Product UI  ·  £ 130/hr  ·  £ 19,500 total', badge: '✓' },
          { icon: 'user', title: 'Kessler AG', sub: 'Print  ·  £ 100/hr  ·  £ 7,100 total', badge: '⏸' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Paused', 'Archived'] },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      content: [
        { type: 'metric-row', items: [
          { label: 'Hours',    value: '82h' },
          { label: 'Billable', value: '£ 8,760' },
          { label: 'Pending',  value: '£ 2,520' },
        ]},
        { type: 'progress', items: [
          { label: 'Oramund   38h', pct: 100 },
          { label: 'Tidewater 28h', pct: 74 },
          { label: 'Vellum    12h', pct: 32 },
          { label: 'Kessler    4h', pct: 11 },
        ]},
        { type: 'metric', label: 'Effective rate trend', value: '↑ 27%', sub: 'Oct 2025 → Mar 2026 · £88 → £112/hr' },
        { type: 'tags', label: 'Period', items: ['Week', 'Month', 'Quarter', 'Year'] },
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'layers' },
    { id: 'log',      label: 'Log',      icon: 'list' },
    { id: 'invoice',  label: 'Invoice',  icon: 'check' },
    { id: 'clients',  label: 'Clients',  icon: 'user' },
    { id: 'reports',  label: 'Reports',  icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'tine-mock', `${design.appName} — Interactive Mock`);
console.log('Mock live at:', result.url || `https://ram.zenbin.org/tine-mock`);
console.log('Status:', result.status);
