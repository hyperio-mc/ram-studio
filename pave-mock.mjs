import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PAVE',
  tagline:   'wealth, made clear',
  archetype: 'personal-finance',
  palette: {
    bg:      '#1A1714',
    surface: '#24201C',
    text:    '#F2EDE8',
    accent:  '#2DD4C0',
    accent2: '#F87060',
    muted:   'rgba(242,237,232,0.45)',
  },
  lightPalette: {
    bg:      '#F9F7F4',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#0F766E',
    accent2: '#C2410C',
    muted:   'rgba(26,23,20,0.42)',
  },
  screens: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Portfolio Value', value: '$284,391', sub: '↑ +$4,218 · +1.51% today' },
        { type: 'metric-row', items: [
          { label: 'Invested', value: '$198,840' },
          { label: 'Gain', value: '+$21,640' },
          { label: 'Return', value: '12.2%' },
        ]},
        { type: 'tags', label: 'Allocation', items: ['US Equities 42%', "Int'l 23%", 'Bonds 18%', 'REIT 10%', 'Cash 7%'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Apple Inc.', sub: 'Buy · 5 shares', badge: '+2.34%' },
          { icon: 'star', title: 'VTI Dividend', sub: 'Received · VANGUARD', badge: '+$82' },
          { icon: 'chart', title: 'VNQ', sub: 'Sell · 10 shares', badge: '-0.55%' },
        ]},
      ],
    },
    {
      id: 'holdings',
      label: 'Holdings',
      content: [
        { type: 'metric-row', items: [
          { label: 'Positions', value: '12' },
          { label: 'Best', value: 'AMZN +3.4%' },
          { label: 'Worst', value: 'VNQ -0.6%' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Apple (AAPL)', sub: '42 shares · US Equities', badge: '+2.34%' },
          { icon: 'chart', title: 'Vanguard VTI', sub: '88 shares · ETF', badge: '+0.87%' },
          { icon: 'chart', title: 'Microsoft (MSFT)', sub: '30 shares · Tech', badge: '+1.12%' },
          { icon: 'chart', title: 'Vanguard BND', sub: '150 shares · Bonds', badge: '-0.23%' },
          { icon: 'chart', title: 'Amazon (AMZN)', sub: '8 shares · US Equities', badge: '+3.41%' },
        ]},
        { type: 'text', label: 'Today\'s Move', value: 'Your portfolio gained $4,218 today, led by AMZN (+3.4%) and AAPL (+2.3%). BND slipped slightly on rate news.' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '91/100', sub: 'Well diversified · Moderate risk' },
        { type: 'metric-row', items: [
          { label: 'Savings Rate', value: '28%' },
          { label: 'Expense Ratio', value: '0.12%' },
          { label: 'Risk Level', value: 'Moderate' },
        ]},
        { type: 'progress', items: [
          { label: 'Diversification', pct: 91 },
          { label: 'Bond Allocation', pct: 18 },
          { label: 'Cash Reserve', pct: 7 },
          { label: 'Savings Rate', pct: 28 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Rebalancing Due', sub: 'US Equities 4% above target', badge: '!' },
          { icon: 'zap', title: 'MSFT Dividend', sub: '$0.75/share · Apr 15', badge: '$' },
          { icon: 'eye', title: 'Tax-Loss Harvest', sub: 'VNQ down 6% — opportunity', badge: '→' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Goals Funded', value: '1 of 4', sub: 'Emergency fund complete · 3 active' },
        { type: 'progress', items: [
          { label: 'Early Retirement · 2042', pct: 24 },
          { label: 'House Down Payment · 2026', pct: 75 },
          { label: 'Emergency Fund · Done', pct: 100 },
          { label: 'Travel Fund · Dec 2025', pct: 53 },
        ]},
        { type: 'list', items: [
          { icon: 'home', title: 'House Down Payment', sub: '$89,400 of $120,000', badge: '75%' },
          { icon: 'heart', title: 'Early Retirement', sub: '$284,391 of $1,200,000', badge: '24%' },
          { icon: 'check', title: 'Emergency Fund', sub: '$30,000 · Fully funded', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Month', value: '+$3,104' },
          { label: 'Transactions', value: '14' },
          { label: 'Dividends', value: '$130.60' },
        ]},
        { type: 'list', items: [
          { icon: 'plus', title: 'Apple Inc. Buy', sub: '5 shares @ $191 · Apr 9', badge: '-$955' },
          { icon: 'star', title: 'VTI Dividend', sub: 'Distribution · Apr 9', badge: '+$82' },
          { icon: 'activity', title: 'VNQ Sell', sub: '10 shares @ $87 · Apr 8', badge: '+$870' },
          { icon: 'zap', title: 'MSFT Buy', sub: '3 shares @ $410 · Apr 7', badge: '-$1,230' },
          { icon: 'plus', title: 'Cash Deposit', sub: 'Monthly contribution · Apr 5', badge: '+$2K' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Rivera · Premium', value: '4y 3m', sub: 'Member since Jan 2022' },
        { type: 'metric-row', items: [
          { label: 'Age', value: '34' },
          { label: 'Returns', value: '+12.2%' },
          { label: 'Tier', value: 'Premium' },
        ]},
        { type: 'tags', label: 'Investment Style', items: ['Passive Index', 'Long-term', 'Low-cost', 'Moderate Risk'] },
        { type: 'list', items: [
          { icon: 'settings', title: 'Investment Style', sub: 'Passive · Long-term growth', badge: '›' },
          { icon: 'lock', title: 'Two-Factor Auth', sub: 'Enabled · Face ID', badge: '✓' },
          { icon: 'share', title: 'Connected Brokers', sub: 'Fidelity · Vanguard', badge: '›' },
          { icon: 'calendar', title: 'Tax Documents', sub: '2025 · 2024 · 2023', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'grid' },
    { id: 'holdings', label: 'Holdings', icon: 'layers' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'goals', label: 'Goals', icon: 'star' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pave-mock', 'PAVE — Interactive Mock');
console.log('Mock live at:', result.url);
