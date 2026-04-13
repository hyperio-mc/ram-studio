import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ALTO',
  tagline:   'Wealth, clearly.',
  archetype: 'personal-finance',
  palette: {
    bg:      '#1C1814',
    surface: '#2A221C',
    text:    '#FAF7F2',
    accent:  '#C8A26E',
    accent2: '#7B9B6B',
    muted:   'rgba(250,247,242,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#4A3728',
    accent2: '#7B9B6B',
    muted:   'rgba(28,24,20,0.4)',
  },
  screens: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Net Worth', value: '$248,392', sub: '+1.32% today · +$3,241' },
        { type: 'metric-row', items: [
          { label: 'Invested', value: '$185K' },
          { label: 'Cash', value: '$63K' },
          { label: 'YTD Return', value: '+12.4%' },
        ]},
        { type: 'tags', label: 'Allocation', items: ['Equity 62%', 'Fixed 23%', 'Cash 15%'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'Apple Inc.', sub: '24 shares · avg $148', badge: '+8.2%' },
          { icon: 'chart', title: 'Microsoft', sub: '12 shares · avg $311', badge: '+5.1%' },
          { icon: 'chart', title: 'Vanguard VTI', sub: '38 shares · avg $198', badge: '+11.4%' },
        ]},
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      content: [
        { type: 'metric', label: '3-Month Return', value: '+3.25%', sub: 'vs S&P 500 +2.1% · You beat it' },
        { type: 'metric-row', items: [
          { label: 'Best Month', value: '+3.2%' },
          { label: 'Worst Month', value: '-0.8%' },
          { label: 'Volatility', value: '11.2%' },
        ]},
        { type: 'progress', items: [
          { label: 'Jan', pct: 62 },
          { label: 'Mar', pct: 81 },
          { label: 'Sep', pct: 97 },
          { label: 'Dec', pct: 74 },
        ]},
        { type: 'text', label: 'Risk Profile', value: 'Risk score 42/100 — Moderate. Well diversified across equities and fixed income.' },
      ],
    },
    {
      id: 'market',
      label: 'Markets',
      content: [
        { type: 'text', label: 'Market Brief', value: 'Equities rally on soft inflation data. CPI at 2.8% — closest to target since 2021.' },
        { type: 'metric-row', items: [
          { label: 'S&P 500', value: '+0.82%' },
          { label: 'Nasdaq', value: '+1.1%' },
          { label: 'Dow', value: '+0.41%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'ARM Holdings', sub: 'NASDAQ · Today', badge: '+6.4%' },
          { icon: 'activity', title: 'Super Micro', sub: 'NASDAQ · Today', badge: '+5.1%' },
          { icon: 'activity', title: 'Paramount', sub: 'NYSE · Today', badge: '-4.8%' },
          { icon: 'activity', title: 'Pfizer', sub: 'NYSE · Today', badge: '-2.9%' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Monthly Target', value: '$2,100', sub: 'needed to stay on track across all goals' },
        { type: 'progress', items: [
          { label: 'Retirement Fund', pct: 68 },
          { label: 'House Down Payment', pct: 44 },
          { label: 'Emergency Fund', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Emergency Fund', sub: '$18,000 · 6 months', badge: '✓' },
          { icon: 'home', title: 'Down Payment', sub: '$44K of $100K · Dec 2026', badge: '44%' },
          { icon: 'star', title: 'Retirement', sub: '$136K of $200K · 2045', badge: '68%' },
        ]},
        { type: 'text', label: 'ALTO Tip', value: 'Increase down payment contribution by $400/mo to reach your Dec 2026 goal on time.' },
      ],
    },
    {
      id: 'transaction',
      label: 'Add',
      content: [
        { type: 'metric', label: 'Order Summary', value: '$2,005', sub: '10 × AAPL @ $200.50 · zero commission' },
        { type: 'metric-row', items: [
          { label: 'Symbol', value: 'AAPL' },
          { label: 'Shares', value: '10' },
          { label: 'Type', value: 'Buy' },
        ]},
        { type: 'tags', label: 'Account', items: ['Brokerage', 'IRA', 'HYSA'] },
        { type: 'text', label: 'Today', value: 'Tap Confirm to log this trade to your portfolio. ALTO tracks your cost basis automatically.' },
      ],
    },
  ],
  nav: [
    { id: 'portfolio',    label: 'Portfolio', icon: 'chart' },
    { id: 'performance',  label: 'Performance', icon: 'activity' },
    { id: 'market',       label: 'Markets', icon: 'search' },
    { id: 'goals',        label: 'Goals', icon: 'star' },
    { id: 'transaction',  label: 'Add', icon: 'plus' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'alto-mock', 'ALTO — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/alto-mock');
