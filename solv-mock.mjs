import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SOLV',
  tagline:   'Know when you\'ll get paid',
  archetype: 'freelance-finance',
  palette: {
    bg:      '#0D0B13',
    surface: '#141121',
    text:    '#EDE9FE',
    accent:  '#A78BFA',
    accent2: '#22D3EE',
    muted:   'rgba(167,139,250,0.4)',
  },
  lightPalette: {
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1E1B2E',
    accent:  '#7C3AED',
    accent2: '#0891B2',
    muted:   'rgba(124,58,237,0.35)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Cash Runway', value: '47 days', sub: 'Healthy · ▲ +12 days vs last month' },
        { type: 'metric-row', items: [
          { label: 'Incoming (30d)', value: '$6,240' },
          { label: 'Overdue', value: '$1,850' },
          { label: 'Pending', value: '$3,100' },
        ]},
        { type: 'text', label: 'Next Payment', value: 'Figma Inc. — $2,400 due in 3 days · On track' },
        { type: 'progress', items: [
          { label: 'Payment Risk Score', pct: 72 },
          { label: 'Runway (47 / 90 days)', pct: 52 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Stripe Inc.', sub: 'Payment received today', badge: '+$1,200' },
          { icon: 'check', title: 'Notion HQ', sub: 'Paid yesterday', badge: '+$3,000' },
          { icon: 'alert', title: 'Acme Co.', sub: '5 days overdue', badge: '$850' },
        ]},
      ],
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      content: [
        { type: 'metric', label: 'Total Pipeline', value: '$11,190', sub: '9 open invoices' },
        { type: 'tags', label: 'Filter', items: ['All', 'Overdue', 'Pending', 'Sent', 'Draft'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Figma Inc. · #2041', sub: 'Due in 3 days · On Track', badge: '$2,400' },
          { icon: 'alert', title: 'Stripe Inc. · #2038', sub: 'Due tomorrow · At Risk', badge: '$1,200' },
          { icon: 'alert', title: 'Acme Co. · #2035', sub: '5 days overdue · Overdue', badge: '$850' },
          { icon: 'star', title: 'Notion HQ · #2031', sub: 'Due in 14 days · Safe', badge: '$3,000' },
          { icon: 'alert', title: 'Linear Ltd. · #2029', sub: 'Due in 8 days · At Risk', badge: '$1,600' },
        ]},
        { type: 'progress', items: [
          { label: 'Acme Co. risk', pct: 88 },
          { label: 'Stripe Inc. risk', pct: 58 },
          { label: 'Linear Ltd. risk', pct: 44 },
        ]},
      ],
    },
    {
      id: 'forecast',
      label: 'Forecast',
      content: [
        { type: 'tags', label: 'Period', items: ['30 days', '60 days', '90 days'] },
        { type: 'metric-row', items: [
          { label: '30-day', value: '$6,240' },
          { label: '60-day', value: '$14,850' },
          { label: '90-day', value: '$22,400' },
        ]},
        { type: 'progress', items: [
          { label: 'Project-based (68%)', pct: 68 },
          { label: 'Retainers (24%)', pct: 24 },
          { label: 'Consulting (8%)', pct: 8 },
        ]},
        { type: 'text', label: 'Scenario Alert', value: 'If Acme Co. stays unpaid, 60-day forecast drops by $850 — runway falls below 30-day warning threshold.' },
        { type: 'list', items: [
          { icon: 'chart', title: '30-day confirmed', sub: '4 invoices in window', badge: '+18%' },
          { icon: 'chart', title: '60-day incl. renewals', sub: '2 retainer renewals', badge: '+31%' },
          { icon: 'chart', title: '90-day estimated', sub: 'Runway projection', badge: '+24%' },
        ]},
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      content: [
        { type: 'metric', label: 'Active Clients', value: '8', sub: 'Avg reliability score: 79 / 100' },
        { type: 'list', items: [
          { icon: 'star', title: 'Figma Inc.', sub: 'Product · Lifetime $24.4k', badge: '96' },
          { icon: 'star', title: 'Notion HQ', sub: 'SaaS · Lifetime $15k', badge: '91' },
          { icon: 'star', title: 'Stripe Inc.', sub: 'FinTech · Lifetime $8.2k', badge: '82' },
          { icon: 'activity', title: 'Vercel Corp.', sub: 'Cloud · Lifetime $9.6k', badge: '88' },
          { icon: 'alert', title: 'Linear Ltd.', sub: 'Dev Tools · At risk', badge: '74' },
          { icon: 'alert', title: 'Acme Co.', sub: 'Enterprise · Overdue', badge: '48' },
        ]},
        { type: 'progress', items: [
          { label: 'Figma — on-time rate', pct: 98 },
          { label: 'Notion — on-time rate', pct: 94 },
          { label: 'Acme — on-time rate', pct: 52 },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'Action Required', value: '3', sub: '2 overdue · 1 at risk · 3 safe' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Acme Co. — 5 days overdue', sub: 'Invoice #2035 · $850 · Send reminder', badge: '!' },
          { icon: 'zap', title: 'Stripe — due tomorrow', sub: 'Invoice #2038 · $1,200 · Not initiated', badge: '⚡' },
          { icon: 'activity', title: 'Runway dropping', sub: 'Falls below 30d in 3 wks if Acme unpaid', badge: '↘' },
          { icon: 'check', title: 'Figma payment expected', sub: 'Invoice #2041 · $2,400 · 98% on-time', badge: '✓' },
          { icon: 'star', title: 'Q1 Summary ready', sub: '$31,200 collected · +24% vs Q4 2025', badge: '★' },
        ]},
        { type: 'text', label: 'Tip', value: 'Sending a polite reminder 3 days before due date reduces late payments by 40% on average.' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'Alex Rivera', value: '$31.2k', sub: 'Q1 earned · 94% on-time · 8 clients' },
        { type: 'tags', label: 'Integrations', items: ['Stripe ✓', 'QuickBooks', 'Wise', 'PayPal'] },
        { type: 'list', items: [
          { icon: 'bell', title: 'Overdue alerts', sub: 'Notify when invoice is past due', badge: 'ON' },
          { icon: 'bell', title: 'Runway warnings', sub: 'Alert when runway < 30 days', badge: 'ON' },
          { icon: 'settings', title: 'Runway warning', sub: 'Alert below: 30 days', badge: '›' },
          { icon: 'settings', title: 'Risk score alert', sub: 'Flag clients below: 60', badge: '›' },
          { icon: 'settings', title: 'Late fee grace', sub: 'Apply after: 7 days', badge: '›' },
        ]},
        { type: 'progress', items: [
          { label: 'Q1 goal progress', pct: 78 },
          { label: 'On-time rate', pct: 94 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Dash', icon: 'home' },
    { id: 'pipeline', label: 'Pipeline', icon: 'list' },
    { id: 'forecast', label: 'Forecast', icon: 'chart' },
    { id: 'clients', label: 'Clients', icon: 'user' },
    { id: 'alerts', label: 'Alerts', icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'solv-mock', 'SOLV — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/solv-mock');
