import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'AURIC',
  tagline:   'Premium Wealth Intelligence',
  archetype: 'fintech-wealth',
  palette: {
    bg:      '#1C1917',
    surface: '#262220',
    text:    '#FAFAF9',
    accent:  '#D4A574',
    accent2: '#6DB89A',
    muted:   'rgba(168,162,158,0.5)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1412',
    accent:  '#B8854A',
    accent2: '#3D8B6E',
    muted:   'rgba(28,20,18,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'TOTAL WEALTH', value: '$847,290', sub: '▲ +2.84% today' },
        { type: 'metric-row', items: [
          { label: 'Invested', value: '$624K' },
          { label: "Today's P&L", value: '+$23,410' },
          { label: 'IRR', value: '18.6%' },
        ]},
        { type: 'text', label: 'MARKET PULSE', value: 'S&P 500 +0.8% · NASDAQ +1.2% · Gold +0.4%' },
        { type: 'list', items: [
          { icon: 'chart', title: 'NVDA', sub: 'NVIDIA Corp. · Equity', badge: '+5.2%' },
          { icon: 'chart', title: 'AAPL', sub: 'Apple Inc. · Equity', badge: '+0.9%' },
          { icon: 'chart', title: 'TSLA', sub: 'Tesla Inc. · Equity', badge: '-2.1%' },
        ]},
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric-row', items: [
          { label: 'Equities', value: '64%' },
          { label: 'Fixed Inc.', value: '20%' },
          { label: 'Cash', value: '6%' },
          { label: 'Alts', value: '10%' },
        ]},
        { type: 'progress', items: [
          { label: 'NVDA', pct: 18 },
          { label: 'AAPL', pct: 14 },
          { label: 'MSFT', pct: 12 },
          { label: 'BTC',  pct: 9 },
          { label: 'GOOGL', pct: 7 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'NVDA', sub: '178.4 shares · $155,902', badge: '+$65.9K' },
          { icon: 'star', title: 'AAPL', sub: '612 shares · $120,115', badge: '+$28.4K' },
          { icon: 'star', title: 'BTC',  sub: '0.124 BTC · $72,808',  badge: '-$1.2K' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'WEEKLY SUMMARY', value: 'Portfolio up 2.84% this week, outperforming S&P 500 by +1.2%. NVDA is your strongest contributor. Consider rebalancing fixed income allocation.' },
        { type: 'metric-row', items: [
          { label: 'Risk Score', value: '6.2' },
          { label: 'Diversification', value: '8.1' },
          { label: 'Fees', value: '9.4' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Rebalance Fixed Income', sub: 'Increase bonds by 4%', badge: 'Medium' },
          { icon: 'zap',   title: 'Harvest Tax Losses',    sub: 'Sell TSLA to offset gains', badge: 'High' },
          { icon: 'activity', title: 'Dividend Reinvestment', sub: 'Auto-reinvest $289/qtr',  badge: 'Low' },
        ]},
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      content: [
        { type: 'tags', label: 'FILTER', items: ['All', 'Buys', 'Sells', 'Dividends'] },
        { type: 'list', items: [
          { icon: 'plus',   title: 'BUY NVDA',  sub: '12 shares · Market order',  badge: '+$10,490' },
          { icon: 'heart',  title: 'DIV AAPL',  sub: 'Quarterly dividend',         badge: '+$38' },
          { icon: 'share',  title: 'SELL TSLA', sub: '8 shares · Limit order',     badge: '-$8,840' },
          { icon: 'plus',   title: 'BUY BTC',   sub: '0.124 BTC · Crypto',        badge: '+$12,200' },
          { icon: 'filter', title: 'FEE BRKR',  sub: 'Monthly platform fee',       badge: '-$9.99' },
        ]},
        { type: 'metric-row', items: [
          { label: 'This Month', value: '+$38.2K' },
          { label: 'Trades', value: '47' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'AURIC GOLD MEMBER', value: 'Alexander Reid', sub: 'Member since 2021' },
        { type: 'metric-row', items: [
          { label: 'Years', value: '5' },
          { label: 'Trades', value: '847' },
          { label: 'Win Rate', value: '68%' },
        ]},
        { type: 'list', items: [
          { icon: 'user',     title: 'Personal Details',  sub: 'Name, email, phone', badge: '›' },
          { icon: 'lock',     title: 'Security & 2FA',   sub: 'Enabled · App auth',  badge: '›' },
          { icon: 'settings', title: 'Appearance',        sub: 'Dark · Warm Charcoal',badge: '›' },
          { icon: 'bell',     title: 'Notifications',     sub: 'Trades, alerts',      badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',      icon: 'home' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'insights',  label: 'Insights',  icon: 'zap' },
    { id: 'activity',  label: 'Activity',  icon: 'activity' },
    { id: 'profile',   label: 'Profile',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'auric-mock', 'AURIC — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/auric-mock');
