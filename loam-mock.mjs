import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LOAM',
  tagline:   'spend with the grain',
  archetype: 'personal-finance',
  palette: {
    bg:      '#2A1F16',
    surface: '#3D2C20',
    text:    '#F5EFE6',
    accent:  '#D4764A',
    accent2: '#8BB87A',
    muted:   'rgba(245,239,230,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F1',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#C4622D',
    accent2: '#7B9B6B',
    muted:   'rgba(28,24,20,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$47,830', sub: '+$1,247 this month ↑ 2.7%' },
        { type: 'metric-row', items: [{ label: 'Spent', value: '$2,140' }, { label: 'Saved', value: '$840' }, { label: 'Left', value: '$460' }] },
        { type: 'progress', items: [{ label: 'Monthly budget', pct: 82 }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Whole Foods Market', sub: 'Groceries · 2h ago', badge: '-$34' },
          { icon: 'zap',      title: 'Blue Bottle Coffee', sub: 'Dining · 5h ago',    badge: '-$6'  },
          { icon: 'check',    title: 'Direct Deposit',     sub: 'Income · Today',     badge: '+$2.8k' },
        ]},
      ],
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric-row', items: [{ label: 'Total Spent', value: '$2,140' }, { label: 'Remaining', value: '$460' }] },
        { type: 'progress', items: [
          { label: 'Housing', pct: 100 },
          { label: 'Groceries', pct: 80 },
          { label: 'Transport', pct: 73 },
          { label: 'Dining (over)', pct: 100 },
          { label: 'Health', pct: 60 },
        ]},
        { type: 'tags', label: 'Period', items: ['Feb', 'Mar', 'Apr ✓', 'May'] },
      ],
    },
    {
      id: 'transactions', label: 'Activity',
      content: [
        { type: 'text', label: 'Today', value: 'April 8 — 3 transactions' },
        { type: 'list', items: [
          { icon: 'heart',    title: 'Whole Foods',    sub: 'Groceries',  badge: '-$34.20' },
          { icon: 'star',     title: 'Blue Bottle',    sub: 'Dining',     badge: '-$6.50'  },
          { icon: 'check',    title: 'Direct Deposit', sub: 'Income',     badge: '+$2,800' },
          { icon: 'map',      title: 'Clipper Card',   sub: 'Transport',  badge: '-$3.25'  },
          { icon: 'home',     title: 'CSA Farm Box',   sub: 'Groceries',  badge: '-$42.00' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Japan Trip 2027', value: '$3,780', sub: '63% of $6,000 · 14 months left' },
        { type: 'progress', items: [
          { label: 'Japan Trip 2027', pct: 63 },
          { label: 'Emergency Fund', pct: 88 },
          { label: 'New Laptop', pct: 55 },
          { label: 'Investment Fund', pct: 30 },
          { label: 'Debt Payoff', pct: 71 },
        ]},
        { type: 'tags', label: 'Status', items: ['On track', 'Ahead', 'Behind', 'Paused'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: '✦ Key Insight', value: 'Dining is 40% over budget — you spent $210 of your $150 limit.' },
        { type: 'metric-row', items: [{ label: 'Oct', value: '$2.3k' }, { label: 'Nov', value: '$2.7k' }, { label: 'Dec', value: '$3.1k' }, { label: 'Apr', value: '$2.1k' }] },
        { type: 'progress', items: [
          { label: 'Housing 56%', pct: 56 },
          { label: 'Groceries 15%', pct: 15 },
          { label: 'Transport 7%', pct: 7 },
          { label: 'Dining 10%', pct: 10 },
        ]},
        { type: 'text', label: '💡 Tip', value: 'Reduce dining by $60 to stay on track this month.' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',     icon: 'home'     },
    { id: 'budget',       label: 'Budget',   icon: 'chart'    },
    { id: 'transactions', label: 'Activity', icon: 'list'     },
    { id: 'goals',        label: 'Goals',    icon: 'star'     },
    { id: 'insights',     label: 'Insights', icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'loam-mock', 'LOAM — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/loam-mock');
