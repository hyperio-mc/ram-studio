import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'INGOT',
  tagline:   'Wealth intelligence, redefined',
  archetype: 'personal-finance',
  palette: {
    bg:      '#1C1917',
    surface: '#231F1B',
    text:    '#FAFAF9',
    accent:  '#D4A574',
    accent2: '#6EE7B7',
    muted:   'rgba(168,162,158,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#B8864E',
    accent2: '#059669',
    muted:   'rgba(28,25,23,0.4)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$2,847,392', sub: '+$14,230 · +0.50% this month' },
        { type: 'metric-row', items: [
          { label: 'Invested', value: '$2.1M' },
          { label: 'Cash', value: '$487K' },
          { label: 'Growth', value: '+18.3%' },
        ]},
        { type: 'progress', items: [
          { label: 'Equities', pct: 68 },
          { label: 'Bonds', pct: 19 },
          { label: 'Alternatives', pct: 13 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'NVDA — NVIDIA', sub: '$107,088 · 120 shares', badge: '+4.2%' },
          { icon: 'activity', title: 'AAPL — Apple', sub: '$96,210 · 450 shares', badge: '+1.8%' },
          { icon: 'activity', title: 'META — Meta', sub: '$31,581 · 55 shares', badge: '-0.9%' },
        ]},
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$2.84M', sub: '+18.3% vs S&P 500 this year' },
        { type: 'tags', label: 'Period', items: ['1D', '1W', '1M', '3M', 'YTD', 'ALL'] },
        { type: 'progress', items: [
          { label: 'NVDA', pct: 38 },
          { label: 'AAPL', pct: 34 },
          { label: 'BRK.B', pct: 14 },
          { label: 'META', pct: 11 },
          { label: 'Others', pct: 3 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'NVDA · 120 shares', sub: '$107,088 · 38% weight', badge: '+4.2%' },
          { icon: 'chart', title: 'AAPL · 450 shares', sub: '$96,210 · 34% weight', badge: '+1.8%' },
          { icon: 'chart', title: 'BRK.B · 88 shares', sub: '$38,544 · 14% weight', badge: '+0.7%' },
        ]},
      ],
    },
    {
      id: 'markets',
      label: 'Markets',
      content: [
        { type: 'metric-row', items: [
          { label: 'S&P 500', value: '5,248' },
          { label: 'NASDAQ', value: '16,384' },
          { label: 'VIX', value: '14.82' },
        ]},
        { type: 'text', label: 'Market Status', value: 'Monday, Apr 13 · Markets open. Broad rally led by tech and AI sectors. NVDA +4.2% on earnings beat.' },
        { type: 'list', items: [
          { icon: 'zap', title: 'TSLA — Trending', sub: 'Earnings beat expectations', badge: '+6.8%' },
          { icon: 'zap', title: 'AMZN — Trending', sub: 'AWS cloud revenue surge', badge: '+3.2%' },
          { icon: 'zap', title: 'GOOG — Trending', sub: 'AI revenue acceleration', badge: '+2.7%' },
          { icon: 'alert', title: 'INTC — Weak', sub: 'Guidance cut surprises', badge: '-4.1%' },
        ]},
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      content: [
        { type: 'metric-row', items: [
          { label: 'April Net', value: '+$18,432' },
          { label: 'Buys', value: '3' },
          { label: 'Dividends', value: '$730' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Buys', 'Sells', 'Dividends'] },
        { type: 'list', items: [
          { icon: 'plus', title: 'BUY · NVDA', sub: '15 shares @ $892.40 · Apr 11', badge: '-$13.4K' },
          { icon: 'star', title: 'DIV · AAPL', sub: 'Quarterly dividend · Apr 8', badge: '+$412' },
          { icon: 'share', title: 'SELL · TSLA', sub: '10 shares @ $248.30 · Apr 5', badge: '+$2.5K' },
          { icon: 'plus', title: 'BUY · BRK.B', sub: '8 shares @ $438.20 · Apr 3', badge: '-$3.5K' },
          { icon: 'star', title: 'DIV · MSFT', sub: 'Quarterly dividend · Apr 1', badge: '+$318' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Total Progress', value: '68%', sub: 'Across all active goals this year' },
        { type: 'progress', items: [
          { label: 'Emergency Fund · $50K goal', pct: 76 },
          { label: 'Down Payment · $200K goal', pct: 56 },
          { label: 'Retirement 2045 · $4M goal', pct: 71 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Emergency Fund', sub: '$38.2K of $50K · Due Jun 2026', badge: '76%' },
          { icon: 'home', title: 'Down Payment', sub: '$112K of $200K · Due Dec 2027', badge: '56%' },
          { icon: 'calendar', title: 'Retirement 2045', sub: '$2.84M of $4M · Ahead', badge: '71%' },
        ]},
        { type: 'text', label: 'Insight', value: 'At current savings rate of $4,200/mo, your Emergency Fund goal will be completed 3 months ahead of schedule.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',     label: 'Overview',  icon: 'home'     },
    { id: 'portfolio',    label: 'Portfolio', icon: 'chart'    },
    { id: 'markets',      label: 'Markets',   icon: 'activity' },
    { id: 'transactions', label: 'Txns',      icon: 'list'     },
    { id: 'goals',        label: 'Goals',     icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'ingot-mock', 'INGOT — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/ingot-mock');
