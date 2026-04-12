import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'CORD',
  tagline: 'Contract intelligence for creative studios',
  archetype: 'studio-ops-light',
  palette: {
    bg:      '#1A1714',
    surface: '#26231F',
    text:    '#F7F4EF',
    accent:  '#7BAFD4',
    accent2: '#D4935A',
    muted:   'rgba(247,244,239,0.40)',
  },
  lightPalette: {
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1C1916',
    accent:  '#2B5A8A',
    accent2: '#8B4A1E',
    muted:   'rgba(28,25,22,0.45)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Revenue MTD', value: '$28,400', sub: '↑ 12% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Active contracts', value: '3' },
          { label: 'Pending invoices', value: '7' },
          { label: 'Hours this week', value: '26.5h' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Prism Brand Identity', sub: 'Prism Labs · $14,200', badge: '62%' },
          { icon: 'alert', title: 'Annual Report Design', sub: 'Stonebridge Co. · $8,500', badge: 'Review' },
          { icon: 'layers', title: 'Product Launch Kit', sub: 'Forge Studio · $5,700', badge: 'Draft' },
        ]},
        { type: 'text', label: 'Next action', value: 'Invoice due for Stonebridge milestone — send within 2 days to stay on schedule.' },
      ],
    },
    {
      id: 'contracts',
      label: 'Contracts',
      content: [
        { type: 'metric', label: 'Prism Brand Identity', value: '$14,200', sub: 'In Progress · 14 days remaining' },
        { type: 'progress', items: [
          { label: 'Discovery & Brief', pct: 100 },
          { label: 'Moodboard & Concept', pct: 100 },
          { label: 'Logo Exploration', pct: 100 },
          { label: 'Identity System v1', pct: 45 },
          { label: 'Client Presentation', pct: 0 },
          { label: 'Final Delivery', pct: 0 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Deposit 30%', value: 'Paid' },
          { label: 'Mid-project 40%', value: 'Invoiced' },
          { label: 'Final 30%', value: 'Pending' },
        ]},
      ],
    },
    {
      id: 'time',
      label: 'Time',
      content: [
        { type: 'metric', label: 'Currently tracking', value: '02:47:33', sub: 'Identity System v1 · Prism Labs' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 94 },
          { label: 'Tue', pct: 67 },
          { label: 'Wed', pct: 83 },
          { label: 'Thu (today)', pct: 50 },
          { label: 'Fri', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Logo concept revision', sub: 'Prism Labs · 09:00', badge: '1h 20m' },
          { icon: 'play', title: 'Brand guideline draft', sub: 'Prism Labs · 10:20', badge: '0h 55m' },
          { icon: 'play', title: 'Stonebridge report cover', sub: 'Stonebridge Co. · 11:15', badge: '0h 32m' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Week billable', value: '24.5h' },
          { label: 'Target', value: '40h' },
          { label: 'Utilisation', value: '78%' },
        ]},
      ],
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: [
        { type: 'metric', label: 'Invoice INV-2026-041', value: '$6,480', sub: 'Prism Labs · Due Apr 15, 2026' },
        { type: 'list', items: [
          { icon: 'list', title: 'Identity System v1', sub: '22h × $120/hr', badge: '$2,640' },
          { icon: 'list', title: 'Logo exploration', sub: '18h × $120/hr', badge: '$2,160' },
          { icon: 'list', title: 'Brand guidelines', sub: '14h × $120/hr', badge: '$1,680' },
        ]},
        { type: 'tags', label: 'Payment methods', items: ['Stripe', 'Wise', 'Bank transfer'] },
        { type: 'text', label: 'Payment link', value: 'cord.app/pay/inv-2026-041 — ready to share with client' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'YTD Revenue', value: '$88,400', sub: '↑ 22% vs same period last year' },
        { type: 'metric-row', items: [
          { label: 'Avg project value', value: '$9,467' },
          { label: 'Utilisation', value: '78%' },
          { label: 'Avg days to pay', value: '11d' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Prism Labs', sub: '3 projects', badge: '$42,800' },
          { icon: 'star', title: 'Stonebridge Co.', sub: '2 projects', badge: '$27,400' },
          { icon: 'star', title: 'Forge Studio', sub: '4 projects', badge: '$18,200' },
        ]},
        { type: 'progress', items: [
          { label: 'Nov', pct: 61 },
          { label: 'Dec', pct: 47 },
          { label: 'Jan', pct: 72 },
          { label: 'Feb', pct: 66 },
          { label: 'Mar', pct: 82 },
          { label: 'Apr', pct: 95 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Home', icon: 'home' },
    { id: 'contracts', label: 'Contracts', icon: 'layers' },
    { id: 'time', label: 'Time', icon: 'activity' },
    { id: 'invoice', label: 'Invoice', icon: 'list' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cord-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
