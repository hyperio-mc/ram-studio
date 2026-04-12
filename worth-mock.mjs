import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WORTH',
  tagline:   'your money, as a story',
  archetype: 'personal-finance',
  palette: {
    bg:      '#1A1614',
    surface: '#242018',
    text:    '#FAF7F2',
    accent:  '#5DB87C',
    accent2: '#E8A24A',
    muted:   'rgba(250,247,242,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#2C6B3F',
    accent2: '#C47D3A',
    muted:   'rgba(26,22,20,0.42)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$84,290', sub: '↑ $2,140 this month' },
        { type: 'metric-row', items: [
          { label: 'Assets', value: '$127,580' },
          { label: 'Liabilities', value: '$43,290' },
        ]},
        { type: 'metric', label: 'Monthly Cashflow', value: '+$1,840', sub: '$5,200 in · $3,360 out' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Blank Street Coffee', sub: 'Food & Drink', badge: '-$6.20' },
          { icon: 'zap',      title: 'Spotify Premium',     sub: 'Subscriptions', badge: '-$11.99' },
          { icon: 'star',     title: 'Payroll deposit',     sub: 'Income',        badge: '+$2,600' },
        ]},
      ],
    },
    {
      id: 'accounts',
      label: 'Accounts',
      content: [
        { type: 'metric', label: 'Total balance', value: '$127,580', sub: '4 accounts linked' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Chase Checking',        sub: '····4291', badge: '$3,842' },
          { icon: 'layers', title: 'Marcus Savings',        sub: '····8830', badge: '$18,200' },
          { icon: 'chart',  title: 'Fidelity 401k',         sub: 'Retirement', badge: '$64,820' },
          { icon: 'chart',  title: 'Robinhood Brokerage',   sub: 'Individual', badge: '$29,778' },
        ]},
        { type: 'tags', label: 'Account types', items: ['Cash', 'Savings', 'Retirement', 'Brokerage'] },
      ],
    },
    {
      id: 'spending',
      label: 'Spending',
      content: [
        { type: 'metric', label: 'Total spent — April', value: '$3,360', sub: 'of $4,000 budget (84%)' },
        { type: 'progress', items: [
          { label: 'Food & Drink',   pct: 82 },
          { label: 'Shopping',       pct: 68 },
          { label: 'Transport',      pct: 34 },
          { label: 'Subscriptions',  pct: 78 },
          { label: 'Health',         pct: 22 },
        ]},
        { type: 'text', label: 'Insight', value: 'Food spending is 12% above your 3-month average. Consider reviewing dining out habits.' },
      ],
    },
    {
      id: 'invest',
      label: 'Invest',
      content: [
        { type: 'metric', label: 'Portfolio value', value: '$94,598', sub: '↑ $1,580 today (+1.7%)' },
        { type: 'metric-row', items: [
          { label: 'US Stocks', value: '58%' },
          { label: "Int'l", value: '18%' },
          { label: 'Bonds', value: '16%' },
          { label: 'Cash', value: '8%' },
        ]},
        { type: 'list', items: [
          { icon: 'chart',    title: 'VTI',   sub: 'Total Stock Market ETF', badge: '+2.1%' },
          { icon: 'chart',    title: 'FXAIX', sub: 'Fidelity 500 Index',    badge: '+1.8%' },
          { icon: 'activity', title: 'VXUS',  sub: 'Total Intl Stock ETF',  badge: '-0.3%' },
          { icon: 'chart',    title: 'BND',   sub: 'Total Bond Market ETF', badge: '+0.1%' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Active goals', value: '4', sub: '2 on track for deadline' },
        { type: 'progress', items: [
          { label: 'Emergency Fund — $15k by Jun', pct: 61 },
          { label: 'Japan Trip — $4.5k by Aug',    pct: 69 },
          { label: 'MacBook — $2.4k by Dec',       pct: 33 },
          { label: 'House Down Payment — $60k',    pct: 31 },
        ]},
        { type: 'tags', label: 'Goal types', items: ['Safety net', 'Travel', 'Tech', 'Property'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Financial health score', value: '82/100', sub: '↑ 4 pts this month' },
        { type: 'metric-row', items: [
          { label: 'Savings rate', value: '35%' },
          { label: 'Debt ratio', value: '34%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Coffee is your #1 impulse spend', sub: '22 purchases · $138 this month', badge: '📊' },
          { icon: 'check',    title: 'Emergency fund on track',         sub: 'On pace for June target',        badge: '🌱' },
          { icon: 'zap',      title: '$680 idle in checking',           sub: 'Move to high-yield savings',     badge: '⚡' },
        ]},
        { type: 'text', label: 'Monthly story', value: 'You grew net worth by $2,140 this month. Savings rate hit 35% — your highest this year.' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'accounts', label: 'Accounts', icon: 'layers' },
    { id: 'spending', label: 'Spend',    icon: 'chart' },
    { id: 'invest',   label: 'Invest',   icon: 'activity' },
    { id: 'goals',    label: 'Goals',    icon: 'star' },
    { id: 'insights', label: 'Insights', icon: 'eye' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'worth-mock', 'WORTH — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/worth-mock`);
