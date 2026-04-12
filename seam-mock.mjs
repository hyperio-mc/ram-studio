import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SEAM',
  tagline:   'Client-to-cash, seamlessly',
  archetype: 'freelance-ops-platform',
  palette: {
    bg:      '#1A1714',
    surface: '#242118',
    text:    '#F5F3EF',
    accent:  '#6366F1',
    accent2: '#10B981',
    muted:   'rgba(245,243,239,0.4)',
  },
  lightPalette: {
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#4F46E5',
    accent2: '#059669',
    muted:   'rgba(28,25,23,0.4)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Active Contracts', value: '12', sub: '+2 this month' },
        { type: 'metric-row', items: [
          { label: 'Unpaid', value: '$18.4k' },
          { label: '30-day Rev', value: '$52k' },
          { label: 'Runway', value: '4.2 mo' },
        ]},
        { type: 'text', label: '✦ AI Insight', value: 'Horizon Creative is 14 days late on INV-082 — send a reminder?' },
        { type: 'list', items: [
          { icon: 'check', title: 'Brand Refresh', sub: 'Horizon Creative · Apr 5', badge: '$8.4k' },
          { icon: 'chart', title: 'Website Redesign', sub: 'Volta Systems · Apr 22', badge: '$14.2k' },
          { icon: 'calendar', title: 'Q2 Campaign', sub: 'Maison Studio · TBD', badge: '$6k' },
        ]},
      ],
    },
    {
      id: 'contracts',
      label: 'Contracts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Proposals', value: '3' },
          { label: 'Active', value: '7' },
          { label: 'Expiring', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Brand Identity System', sub: 'Horizon Creative · Ends Jun 30', badge: 'Active' },
          { icon: 'check', title: 'Full-Stack Build', sub: 'Volta Systems · Ends Sep 15', badge: 'Active' },
          { icon: 'star', title: 'Q2 Campaign Suite', sub: 'Maison Studio · Expires Apr 10', badge: 'Proposal' },
          { icon: 'alert', title: 'Annual Retainer', sub: 'Pellucid Labs · Expires Apr 5', badge: 'Expiring' },
          { icon: 'star', title: 'UX Audit', sub: 'Nexa Health · Draft', badge: 'Proposal' },
        ]},
      ],
    },
    {
      id: 'invoices',
      label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Awaiting', value: '$18.4k' },
          { label: 'Overdue', value: '$3.2k' },
          { label: 'This month', value: '$21.6k' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'INV-082 — Horizon Creative', sub: 'Brand Refresh Phase 2', badge: 'Overdue' },
          { icon: 'zap', title: 'INV-081 — Volta Systems', sub: 'Website Build Milestone 1', badge: 'Pending' },
          { icon: 'zap', title: 'INV-080 — Maison Studio', sub: 'Strategy Workshop', badge: 'Pending' },
          { icon: 'check', title: 'INV-079 — Pellucid Labs', sub: 'Monthly Retainer March', badge: 'Paid' },
          { icon: 'check', title: 'INV-078 — Nexa Health', sub: 'UX Audit Deliverables', badge: 'Paid' },
        ]},
      ],
    },
    {
      id: 'cashflow',
      label: 'Cash Flow',
      content: [
        { type: 'metric', label: 'March Revenue', value: '$52,000', sub: '↑ 14% vs February' },
        { type: 'progress', items: [
          { label: 'Invoice payments received', pct: 85 },
          { label: 'Retainer (Pellucid Labs)', pct: 100 },
          { label: 'SaaS subscriptions (out)', pct: 16 },
          { label: 'Contract staff (out)', pct: 80 },
        ]},
        { type: 'tags', label: 'Runway', items: ['4.2 months', 'Apr proj: $48k', 'Streak: 6 mo growth'] },
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      content: [
        { type: 'metric', label: 'Client Health Avg', value: '84%', sub: '5 active clients' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Volta Systems', sub: 'Product Startup · $38.2k LTM', badge: '94%' },
          { icon: 'alert', title: 'Horizon Creative', sub: 'Agency · $14.6k LTM', badge: '62%' },
          { icon: 'star', title: 'Pellucid Labs', sub: 'Enterprise Retainer · $36k LTM', badge: '88%' },
          { icon: 'user', title: 'Maison Studio', sub: 'Creative Agency · $6k LTM', badge: '71%' },
          { icon: 'user', title: 'Nexa Health', sub: 'Healthcare · $4.8k LTM', badge: '60%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview', icon: 'home' },
    { id: 'contracts', label: 'Contracts', icon: 'layers' },
    { id: 'invoices',  label: 'Invoices', icon: 'list' },
    { id: 'cashflow',  label: 'Cash', icon: 'chart' },
    { id: 'clients',   label: 'Clients', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'seam-mock', 'SEAM — Interactive Mock');
console.log('Mock live at:', result.url);
