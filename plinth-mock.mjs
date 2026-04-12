import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PLINTH',
  tagline:   'Your financial foundation',
  archetype: 'personal-finance',

  palette: {
    bg:      '#1C1917',
    surface: '#28211E',
    text:    '#F5F0EA',
    accent:  '#14B8A6',
    accent2: '#F59E0B',
    muted:   'rgba(245,240,234,0.45)',
  },

  lightPalette: {
    bg:      '#F7F5F1',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#0F766E',
    accent2: '#B45309',
    muted:   'rgba(28,25,23,0.42)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$124,830', sub: '+$2,140 this month' },
        { type: 'metric-row', items: [
          { label: 'Budget Used', value: '68%' },
          { label: 'Savings Rate', value: '23%' },
          { label: 'Cash Flow', value: '+$840' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Blue Bottle Coffee', sub: 'Food · Today', badge: '-$6.50' },
          { icon: 'map', title: 'Transit Card', sub: 'Transport · Today', badge: '-$4.20' },
          { icon: 'zap', title: 'Payroll', sub: 'Income · Yesterday', badge: '+$4,200' },
        ]},
      ],
    },
    {
      id: 'spending',
      label: 'Spending',
      content: [
        { type: 'metric', label: 'Total Spent — April', value: '$1,240', sub: 'of $1,800 budget · 69%' },
        { type: 'progress', items: [
          { label: 'Housing',    pct: 48 },
          { label: 'Groceries', pct: 22 },
          { label: 'Dining Out',pct: 14 },
          { label: 'Transport', pct: 12 },
          { label: 'Entertain', pct: 7  },
        ]},
        { type: 'tags', label: 'Over Budget', items: ['Dining Out', 'Entertainment'] },
        { type: 'text', label: 'Tip', value: 'You are on track for 7 of 9 categories. Dining is $40 over — consider a weekend cap.' },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Saved', value: '$18,430' },
          { label: 'On Track', value: '2 / 3' },
          { label: 'Monthly Auto', value: '$650' },
        ]},
        { type: 'progress', items: [
          { label: 'Emergency Fund — $10K',  pct: 72 },
          { label: 'Japan Trip — $5K',       pct: 42 },
          { label: 'MacBook — $2.5K',        pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'MacBook Fund', sub: 'Goal reached! Congratulations.', badge: '✓' },
          { icon: 'star',  title: 'Emergency Fund', sub: 'Jun 2026 · +$450/mo', badge: 'Active' },
          { icon: 'heart', title: 'Japan Trip', sub: 'Dec 2026 · +$200/mo', badge: 'Active' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'AI Insight', value: 'You spend 40% more on dining on weekends. A $50 weekly cap could save you $200/month — that\'s $2,400 toward your Japan goal.' },
        { type: 'progress', items: [
          { label: 'Oct', pct: 61 },
          { label: 'Nov', pct: 75 },
          { label: 'Dec', pct: 88 },
          { label: 'Jan', pct: 66 },
          { label: 'Feb', pct: 71 },
          { label: 'Mar', pct: 66 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Savings up 12%', sub: 'vs last month', badge: '↑' },
          { icon: 'alert', title: 'Dining over budget', sub: 'by $40 this month', badge: '!' },
          { icon: 'zap',   title: 'Japan: on track', sub: 'Dec 2026 deadline', badge: '✓' },
          { icon: 'star',  title: 'Reduce subscriptions', sub: 'Save $68/month', badge: '💡' },
        ]},
      ],
    },
    {
      id: 'accounts',
      label: 'Accounts',
      content: [
        { type: 'metric', label: 'Total Net Balance', value: '$75,590', sub: '4 accounts connected' },
        { type: 'list', items: [
          { icon: 'home',   title: 'Chase Checking',   sub: 'Last synced now',   badge: '$4,280' },
          { icon: 'star',   title: 'Marcus Savings',   sub: 'Last synced now',   badge: '$14,150' },
          { icon: 'chart',  title: 'Fidelity Invest',  sub: 'Last synced now',   badge: '$58,400' },
          { icon: 'lock',   title: 'Amex Gold Credit', sub: 'Due in 12 days',    badge: '-$1,240' },
        ]},
        { type: 'tags', label: 'Institution Types', items: ['Checking', 'Savings', 'Investment', 'Credit'] },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home'     },
    { id: 'spending',  label: 'Spend',   icon: 'chart'    },
    { id: 'goals',     label: 'Goals',   icon: 'star'     },
    { id: 'insights',  label: 'Insight', icon: 'activity' },
    { id: 'accounts',  label: 'More',    icon: 'layers'   },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'plinth-mock', 'PLINTH — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/plinth-mock`);
