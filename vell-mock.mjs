import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VELL',
  tagline:   'Your money, clearly annotated',
  archetype: 'personal-finance',
  palette: {           // dark fallback
    bg:      '#1C1814',
    surface: '#242018',
    text:    '#FAF8F4',
    accent:  '#C05A2E',
    accent2: '#4A7C59',
    muted:   'rgba(250,248,244,0.45)',
  },
  lightPalette: {      // LIGHT — primary theme
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#C05A2E',
    accent2: '#4A7C59',
    muted:   'rgba(28,24,20,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$42,850', sub: '+$1,240 this month — annotated' },
        { type: 'metric-row', items: [
          { label: 'Savings', value: '$8,420' },
          { label: 'Expenses', value: '$2,310' },
          { label: 'Invested', value: '$18.6k' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Whole Foods Market', sub: 'Groceries · Apr 8', badge: '-$67' },
          { icon: 'zap',      title: 'Netflix',           sub: 'Entertainment',     badge: '-$16' },
          { icon: 'check',    title: 'Salary Deposit',    sub: 'Income · Apr 1',    badge: '+$3.2k' },
        ]},
      ],
    },
    {
      id: 'spending', label: 'Spending',
      content: [
        { type: 'metric', label: 'April Total', value: '$2,310', sub: '22 days remaining in budget' },
        { type: 'progress', items: [
          { label: 'Housing',       pct: 100 },
          { label: 'Food & Dining', pct: 96 },
          { label: 'Transport',     pct: 139 },
          { label: 'Entertainment', pct: 65 },
          { label: 'Shopping',      pct: 92 },
        ]},
        { type: 'tags', label: 'Categories', items: ['Housing 35%', 'Food 25%', 'Transport 18%', 'Other 22%'] },
      ],
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric', label: 'Monthly Budget', value: '$3,500', sub: '66% used — $1,190 remaining' },
        { type: 'progress', items: [
          { label: 'Housing $1,200',      pct: 100 },
          { label: 'Food $578/$600',      pct: 96 },
          { label: 'Transport ⚠ over!',  pct: 100 },
          { label: 'Entertainment $97',   pct: 65 },
          { label: 'Health $45',          pct: 45 },
        ]},
        { type: 'text', label: 'Annotation', value: 'Transport is 38% over budget — $116 above the $300 limit. Consider fewer Ubers this week.' },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active goals', value: '3' },
          { label: 'Reached', value: '1' },
          { label: 'On track', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Emergency Fund', sub: '$7,200 / $10,000 · Jun 2026', badge: '72%' },
          { icon: 'map',    title: 'Japan Trip',     sub: '$1,800 / $4,500 · Oct 2026',  badge: '40%' },
          { icon: 'check',  title: 'New Laptop',     sub: '$2,200 / $2,200 — Reached!',  badge: '✓' },
        ]},
        { type: 'text', label: 'Tip', value: 'Save ~$467/month to hit the Emergency Fund by June.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'list', items: [
          { icon: 'alert',    title: 'Coffee spend up 34%',          sub: '$187 this month — $47 above average',   badge: 'PATTERN' },
          { icon: 'check',    title: 'Groceries under budget',       sub: 'Saved $264 over 6 months',             badge: 'WIN' },
          { icon: 'eye',      title: 'Cancel unused subscriptions',  sub: '3 unused · $43/mo waste',              badge: 'TIP' },
          { icon: 'activity', title: 'End-of-month projection',      sub: '$890 left — $120 above target',        badge: 'FORECAST' },
        ]},
        { type: 'text', label: 'This week', value: 'Your spending is 12% lower than last Wednesday. Keep going.' },
      ],
    },
    {
      id: 'account', label: 'Account',
      content: [
        { type: 'metric', label: 'Sarah Chen', value: '$42.8k', sub: 'net worth · member since Jan 2024' },
        { type: 'metric-row', items: [
          { label: 'Member since', value: 'Jan 2024' },
          { label: 'Goals', value: '3 active' },
          { label: 'Streak', value: '48 days' },
        ]},
        { type: 'list', items: [
          { icon: 'user',     title: 'Personal details',  sub: 'Name, email, photo',       badge: '›' },
          { icon: 'layers',   title: 'Linked accounts',   sub: '2 banks connected',         badge: '›' },
          { icon: 'bell',     title: 'Notifications',     sub: 'Weekly summary on',         badge: '›' },
          { icon: 'settings', title: 'Appearance',        sub: 'Light theme · Inter',       badge: '›' },
          { icon: 'share',    title: 'Data export',       sub: 'CSV, PDF available',        badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home' },
    { id: 'spending',  label: 'Spend',   icon: 'chart' },
    { id: 'budget',    label: 'Budget',  icon: 'filter' },
    { id: 'goals',     label: 'Goals',   icon: 'star' },
    { id: 'account',   label: 'You',     icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vell-mock', 'VELL — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/vell-mock');
