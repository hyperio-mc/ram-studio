import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Float',
  tagline:   'Your money, self-managing',
  archetype: 'fintech-ops-dashboard',
  palette: {
    bg:      '#0F1221',
    surface: '#161A2E',
    text:    '#E8EAF2',
    accent:  '#1B4ED8',
    accent2: '#D97706',
    muted:   'rgba(232,234,242,0.40)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#151210',
    accent:  '#1B4ED8',
    accent2: '#D97706',
    muted:   'rgba(21,18,16,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Cash Balance', value: '$48,320', sub: '8.2 months runway' },
        { type: 'metric-row', items: [
          { label: 'Income MTD', value: '$12.4K' },
          { label: 'Expenses', value: '$6.8K' },
          { label: 'Net Flow', value: '+$5.6K' },
        ]},
        { type: 'progress', items: [
          { label: 'Monthly Revenue Target', pct: 72 },
          { label: 'Expense Budget Used', pct: 54 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Client Payment — Relay', sub: 'Income · Today', badge: '+$4,200' },
          { icon: 'layers', title: 'AWS Services', sub: 'Infrastructure · Today', badge: '-$189' },
          { icon: 'star', title: 'Figma Pro', sub: 'Software · Mar 28', badge: '-$45' },
        ]},
        { type: 'text', label: 'Agent Status', value: '3 agents working — 14 txns reconciled, 2 invoices matched, 1 reminder sent' },
      ],
    },
    {
      id: 'transactions', label: 'Transactions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Transactions', value: '28' },
          { label: 'Income', value: '$12.4K' },
          { label: 'Expenses', value: '$6.8K' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Client Payment — Relay', sub: 'Income · Mar 29', badge: '+$4,200' },
          { icon: 'layers', title: 'AWS Services', sub: 'Infrastructure · Mar 29', badge: '-$189' },
          { icon: 'star', title: 'Figma Pro', sub: 'Software · Mar 28', badge: '-$45' },
          { icon: 'home', title: 'WeWork Office', sub: 'Facilities · Mar 27', badge: '-$680' },
          { icon: 'zap', title: 'Retainer — Acme Co.', sub: 'Income · Mar 26', badge: '+$2,800' },
          { icon: 'code', title: 'OpenAI API', sub: 'AI/Software · Mar 25', badge: '-$112' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Income', 'Expenses', 'Pending'] },
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Outstanding', value: '$8,500' },
          { label: 'Paid MTD', value: '$11,700' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Relay Digital — INV-2043', sub: 'Due Mar 31 · DUE SOON', badge: '$4,200' },
          { icon: 'share', title: 'Acme Co. — INV-2042', sub: 'Due Apr 5 · SENT', badge: '$2,800' },
          { icon: 'eye', title: 'Northfield Inc. — INV-2041', sub: 'Due Apr 12 · DRAFT', badge: '$1,500' },
          { icon: 'check', title: 'Petra Labs — INV-2040', sub: 'Mar 15 · PAID', badge: '$8,500' },
          { icon: 'check', title: 'Solaris Co. — INV-2039', sub: 'Mar 10 · PAID', badge: '$3,200' },
        ]},
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '3' },
          { label: 'Tasks Done', value: '58' },
          { label: 'Queued', value: '1' },
        ]},
        { type: 'progress', items: [
          { label: 'Reconciler (14/14 tasks)', pct: 100 },
          { label: 'Tax Prep (38/62 tasks)', pct: 61 },
          { label: 'Invoice Tracker (6/6)', pct: 100 },
          { label: 'Cash Forecast (0/1)', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Matched INV-2043 → AWS $189.50', sub: 'Reconciler · 9:41', badge: '✓' },
          { icon: 'filter', title: 'Tagged 8 SaaS items deductible', sub: 'Tax Prep · 9:39', badge: '✓' },
          { icon: 'zap', title: 'WeWork auto-categorized Facilities', sub: 'Reconciler · 9:35', badge: '✓' },
          { icon: 'bell', title: 'Reminder: INV-2043 due in 2 days', sub: 'Invoice Tracker · 9:28', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric', label: 'Net Cashflow — Mar 2026', value: '+$5,580', sub: '↑ vs $4,400 last month' },
        { type: 'progress', items: [
          { label: 'Infrastructure (28%)', pct: 28 },
          { label: 'Software & Tools (22%)', pct: 22 },
          { label: 'Facilities (20%)', pct: 20 },
          { label: 'Marketing (18%)', pct: 18 },
          { label: 'Other (12%)', pct: 12 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Revenue', value: '$12.4K' },
          { label: 'Expenses', value: '$6.8K' },
          { label: 'Margin', value: '45%' },
        ]},
        { type: 'text', label: 'Year to Date', value: 'Q1 2026 revenue $31,200 — up 18% vs Q1 2025. Expenses well-controlled at $19,400. Strong cash position heading into Q2.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',      label: 'Overview',  icon: 'home' },
    { id: 'transactions',  label: 'Txns',      icon: 'list' },
    { id: 'invoices',      label: 'Invoices',  icon: 'layers' },
    { id: 'agents',        label: 'Agents',    icon: 'zap' },
    { id: 'reports',       label: 'Reports',   icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'float-app-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
