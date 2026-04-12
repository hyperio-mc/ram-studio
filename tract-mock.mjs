import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TRACT',
  tagline:   'Finance, in print',
  archetype: 'personal-finance',

  palette: {           // dark theme (required)
    bg:      '#1A1714',
    surface: '#221E1A',
    text:    '#FAF7F2',
    accent:  '#C45E3A',
    accent2: '#4A7C6B',
    muted:   'rgba(250,247,242,0.4)',
  },

  lightPalette: {      // light theme — the primary editorial palette
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#C45E3A',
    accent2: '#4A7C6B',
    muted:   'rgba(26,23,20,0.45)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$24,847', sub: 'April 2026 · All accounts' },
        { type: 'metric-row', items: [
          { label: 'Income', value: '$5,840' },
          { label: 'Spent', value: '$2,193' },
          { label: 'Saved', value: '$3,647' },
        ]},
        { type: 'list', items: [
          { icon: 'home',     title: 'Housing',      sub: 'Fixed · 54%',   badge: '$1,200' },
          { icon: 'star',     title: 'Food & Dining', sub: '↑ +12%',        badge: '$342' },
          { icon: 'activity', title: 'Transport',     sub: 'On track',      badge: '$184' },
          { icon: 'heart',    title: 'Entertainment', sub: '↑ +34%',        badge: '$267' },
        ]},
        { type: 'text', label: 'Upcoming Bills', value: 'Rent $2,100 due Apr 12 · Netflix $15.99 Apr 14 · Spotify $16.99 Apr 15' },
      ],
    },
    {
      id: 'spending',
      label: 'Spending',
      content: [
        { type: 'metric', label: 'Total Spent — April', value: '$2,193', sub: 'of $3,000 budget · 73% used' },
        { type: 'progress', items: [
          { label: 'Housing',       pct: 100 },
          { label: 'Food',          pct: 46 },
          { label: 'Entertainment', pct: 89 },
          { label: 'Transport',     pct: 32 },
          { label: 'Health',        pct: 22 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Nov', value: '$1.8k' },
          { label: 'Dec', value: '$2.8k' },
          { label: 'Jan', value: '$2.2k' },
          { label: 'Feb', value: '$2.4k' },
          { label: 'Mar', value: '$1.9k' },
          { label: 'Apr', value: '$2.2k' },
        ]},
        { type: 'tags', label: 'Over Budget', items: ['Entertainment', 'Food'] },
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      content: [
        { type: 'list', items: [
          { icon: 'star',     title: 'Morning Ritual Coffee', sub: 'Today · Dining',       badge: '-$6.80' },
          { icon: 'check',    title: 'Substack Quarterly',    sub: 'Today · Subscriptions', badge: '-$30' },
          { icon: 'zap',      title: 'Salary Deposit',        sub: 'Today · Income',        badge: '+$2,920' },
          { icon: 'home',     title: 'Whole Foods Market',    sub: 'Yesterday · Groceries', badge: '-$67' },
          { icon: 'map',      title: 'Caltrain Monthly',      sub: 'Yesterday · Transit',   badge: '-$120' },
          { icon: 'eye',      title: 'SFMOMA Membership',     sub: 'Yesterday · Culture',   badge: '-$85' },
          { icon: 'share',    title: 'Freelance Invoice #12', sub: 'Apr 7 · Income',        badge: '+$800' },
          { icon: 'heart',    title: 'Nopa Restaurant',       sub: 'Apr 7 · Dining',        badge: '-$94' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'Income', 'Expenses', 'Dining'] },
      ],
    },
    {
      id: 'savings',
      label: 'Savings',
      content: [
        { type: 'metric', label: 'Total in Goals', value: '$18,340', sub: '4 active goals · 28.4% savings rate' },
        { type: 'progress', items: [
          { label: 'Emergency Fund — $10,250 of $15,000', pct: 68 },
          { label: 'Japan Trip 2026 — $3,890 of $5,000',  pct: 78 },
          { label: 'MacBook Pro — $2,400 of $3,200',      pct: 75 },
          { label: 'Investment Seed — $1,800 of $20,000', pct: 9  },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'Emergency Fund', sub: 'Priority · 4 months left',  badge: '68%' },
          { icon: 'map',      title: 'Japan Trip',     sub: 'On track · June 2026',      badge: '78%' },
          { icon: 'code',     title: 'MacBook Pro',    sub: 'On track',                  badge: '75%' },
          { icon: 'chart',    title: 'Investment Seed',sub: 'Long term · 18 months',     badge: '9%' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview',      label: 'Overview',      icon: 'home' },
    { id: 'spending',      label: 'Spending',       icon: 'chart' },
    { id: 'transactions',  label: 'Transactions',   icon: 'list' },
    { id: 'savings',       label: 'Savings',        icon: 'star' },
  ],
};

console.log('Building Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Compiling mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

console.log('Publishing mock...');
const result = await publishMock(html, 'tract-mock', 'TRACT — Interactive Mock');
console.log('Mock live at:', result.url ?? `https://ram.zenbin.org/tract-mock`);
console.log('Status:', result.status);
