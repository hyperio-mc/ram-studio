import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Yield',
  tagline:   'Know exactly where your money comes from',
  archetype: 'finance-analytics-dashboard',
  palette: {
    bg:      '#07070F',
    surface: '#161628',
    text:    '#E6E3FF',
    accent:  '#7C6FFF',
    accent2: '#3DFFC0',
    muted:   'rgba(230,227,255,0.38)',
  },
  lightPalette: {
    bg:      '#F5F5FF',
    surface: '#FFFFFF',
    text:    '#1A1825',
    accent:  '#6655EE',
    accent2: '#00C896',
    muted:   'rgba(26,24,37,0.42)',
  },
  screens: [
    {
      id: 'revenue',
      label: 'Revenue',
      content: [
        { type: 'metric', label: 'Monthly Recurring Revenue', value: '$12,840', sub: '↑ +18.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'New MRR', value: '$3.2K' },
          { label: 'Churned', value: '$680' },
          { label: 'Customers', value: '94' },
        ]},
        { type: 'metric', label: 'Annual Run Rate', value: '$154,080', sub: 'On track · 64% to $20K goal' },
        { type: 'text', label: 'Recent Transactions', value: 'Latest payments across Gumroad, Lemon Squeezy, and Stripe' },
        { type: 'list', items: [
          { icon: 'star', title: 'Indie Course Bundle', sub: 'Gumroad · 2m ago', badge: '+$299' },
          { icon: 'user', title: 'Pro Membership · @kai', sub: 'Stripe · 1h ago', badge: '+$49' },
          { icon: 'alert', title: 'Stripe Processing Fee', sub: '2.9% + 30¢', badge: '-$8.70' },
        ]},
      ],
    },
    {
      id: 'sources',
      label: 'Sources',
      content: [
        { type: 'text', label: 'Revenue by Source', value: 'How $12,840 MRR breaks down across your income streams' },
        { type: 'metric-row', items: [
          { label: 'Courses', value: '55%' },
          { label: 'Subscriptions', value: '30%' },
          { label: 'Consulting', value: '15%' },
        ]},
        { type: 'progress', items: [
          { label: 'Indie OS Course', pct: 85 },
          { label: 'Build in Public Kit', pct: 58 },
          { label: 'Monthly Membership', pct: 50 },
          { label: 'Design Consulting', pct: 39 },
          { label: 'Templates Bundle', pct: 28 },
        ]},
        { type: 'tags', label: 'Revenue Channels', items: ['Gumroad', 'Lemon Squeezy', 'Stripe', 'Consulting'] },
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      content: [
        { type: 'metric', label: 'Total Audience', value: '47,820', sub: '↑ +2,310 new followers this month' },
        { type: 'list', items: [
          { icon: 'message', title: 'Newsletter', sub: '18,420 subscribers', badge: '+840' },
          { icon: 'share', title: 'Twitter / X', sub: '14,200 followers', badge: '+620' },
          { icon: 'play', title: 'YouTube', sub: '9,100 subscribers', badge: '+390' },
          { icon: 'user', title: 'LinkedIn', sub: '6,100 followers', badge: '+460' },
        ]},
        { type: 'metric', label: 'Newsletter Open Rate', value: '42.7%', sub: '2× industry avg of 21% · Trending up' },
      ],
    },
    {
      id: 'ledger',
      label: 'Ledger',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Income', 'Fees', 'Refunds'] },
        { type: 'text', label: 'Today', value: '3 transactions · Net +$339.02' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Indie OS Course', sub: 'One-time · Gumroad', badge: '+$299' },
          { icon: 'zap', title: 'Pro Membership', sub: 'Monthly renewal · @kai_builds', badge: '+$49' },
          { icon: 'alert', title: 'Stripe Processing', sub: '2.9% + 30¢ fee', badge: '-$8.98' },
        ]},
        { type: 'text', label: 'Yesterday', value: '4 transactions · Net +$324.41' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Template Pack Sale', sub: 'Lemon Squeezy · @uxstudio', badge: '+$79' },
          { icon: 'zap', title: 'Design Consultation', sub: '2hr session · @growthco', badge: '+$300' },
          { icon: 'alert', title: 'Refund · @anon_user', sub: 'Within 30-day window', badge: '-$49' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Active Goal — $20K MRR by June 2026', value: '64%', sub: '$12,840 of $20,000 · 85 days remaining' },
        { type: 'progress', items: [
          { label: 'Goal progress', pct: 64 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '$5K MRR', sub: 'Achieved Jan 12', badge: '✓' },
          { icon: 'check', title: '$10K MRR', sub: 'Achieved Feb 28', badge: '✓' },
          { icon: 'activity', title: '$15K MRR', sub: 'Target: Apr 15', badge: '→' },
          { icon: 'star', title: '$20K MRR', sub: 'Target: Jun 30', badge: '◇' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Needed / mo', value: '$3.6K' },
          { label: 'At current pace', value: 'May 18' },
          { label: 'Confidence', value: '87%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'revenue', label: 'Revenue', icon: 'chart' },
    { id: 'sources', label: 'Sources', icon: 'layers' },
    { id: 'audience', label: 'Audience', icon: 'eye' },
    { id: 'ledger', label: 'Ledger', icon: 'list' },
    { id: 'goals', label: 'Goals', icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'yield-mock', 'Yield — Revenue Intelligence Mock');
console.log('Mock live at:', result.url);
