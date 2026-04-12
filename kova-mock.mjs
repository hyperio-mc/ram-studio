import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KOVA',
  tagline:   'Wealth Intelligence',
  archetype: 'finance-wealth',
  palette: {
    bg:      '#0F0D0A',
    surface: '#16130F',
    text:    '#F5EDE0',
    accent:  '#D4A574',
    accent2: '#E8C07D',
    muted:   'rgba(122,107,87,0.5)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#B87040',
    accent2: '#C98948',
    muted:   'rgba(26,20,16,0.4)',
  },
  screens: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Portfolio Value', value: '$847,294', sub: '+12.4% this quarter' },
        { type: 'metric-row', items: [
          { label: 'IRR', value: '+14.2%' },
          { label: 'Sharpe', value: '1.84' },
          { label: 'Max DD', value: '-3.1%' },
          { label: 'Volatility', value: '9.2%' },
        ]},
        { type: 'tags', label: 'Allocation', items: ['Equities 62%', 'Fixed Income 21%', 'Alts 11%', 'Cash 6%'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Auto-Rebalance Complete', sub: '2 hours ago', badge: '✓' },
          { icon: 'chart', title: 'Dividends Received', sub: '1 day ago', badge: '$247' },
          { icon: 'alert', title: 'Risk Alert Triggered', sub: '3 days ago', badge: '!' },
        ]},
      ],
    },
    {
      id: 'markets',
      label: 'Markets',
      content: [
        { type: 'metric', label: 'Market Sentiment', value: 'Bullish', sub: '66/100 Confidence Index' },
        { type: 'list', items: [
          { icon: 'chart', title: 'S&P 500 · SPY', sub: '$5,842.14', badge: '+1.23%' },
          { icon: 'star', title: 'Apple Inc. · AAPL', sub: '$229.87', badge: '+0.84%' },
          { icon: 'zap', title: 'Gold Futures · GC=F', sub: '$3,248.50', badge: '+0.61%' },
          { icon: 'activity', title: 'Bitcoin · BTC', sub: '$87,450.00', badge: '-2.14%' },
          { icon: 'layers', title: 'US 10Y Tsy · TNX', sub: '4.312%', badge: '-0.04%' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'Equities', 'Fixed Income', 'Crypto', 'Commodities'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'KOVA Intelligence Score', value: '84 / 100', sub: 'Strong Position — well-positioned for macro conditions' },
        { type: 'progress', items: [
          { label: 'Diversification Score', pct: 88 },
          { label: 'Risk-Adjusted Return', pct: 79 },
          { label: 'Drawdown Management', pct: 84 },
          { label: 'Tax Efficiency', pct: 71 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Reduce Tech Concentration', sub: 'Tech at 34% — rotate to value', badge: 'HIGH' },
          { icon: 'zap', title: 'Fixed Income Opportunity', sub: '10Y Tsy at 4.5% resistance', badge: 'MED' },
          { icon: 'check', title: 'Tax-Loss Harvesting Window', sub: '$4,200 estimated tax benefit', badge: 'LOW' },
        ]},
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      content: [
        { type: 'metric-row', items: [
          { label: 'Transactions', value: '47' },
          { label: 'Volume', value: '$124K' },
          { label: 'Realized P&L', value: '+$8.4K' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Buy VTI · Vanguard Total Market', sub: '106 shares @ $141.50', badge: '+$15K' },
          { icon: 'activity', title: 'Sell TSLA · Tesla Inc.', sub: '28 shares @ $300.71', badge: '-$8.4K' },
          { icon: 'star', title: 'AAPL Dividend Q1 2026', sub: 'Apr 7, 2026', badge: '+$247' },
          { icon: 'layers', title: 'Auto-Rebalance', sub: 'Equity → Fixed Income', badge: 'AUTO' },
          { icon: 'zap', title: 'Buy AGG · iShares Core', sub: '107 shares @ $112.15', badge: '+$12K' },
        ]},
      ],
    },
    {
      id: 'holdings',
      label: 'Holdings',
      content: [
        { type: 'tags', label: 'Asset Class', items: ['All', 'Equities', 'Bonds', 'Alts'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'Apple Inc. · AAPL', sub: '124 shares · $28,503', badge: '+26%' },
          { icon: 'chart', title: 'Vanguard Total Mkt · VTI', sub: '312 shares · $44,200', badge: '+18%' },
          { icon: 'layers', title: 'iShares Core Bond · AGG', sub: '241 shares · $27,028', badge: '+4%' },
          { icon: 'star', title: 'Gold ETF · GLD', sub: '88 shares · $22,104', badge: '+31%' },
          { icon: 'activity', title: 'BTC via Coinbase', sub: '0.428 BTC · $37,448', badge: '-12%' },
        ]},
        { type: 'text', label: 'KOVA AI', value: 'Your top equity holdings are technically strong with bullish MACD crossovers on AAPL and VTI. Consider reducing BTC exposure given current volatility regime.' },
      ],
    },
  ],
  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'markets',   label: 'Markets',   icon: 'activity' },
    { id: 'insights',  label: 'Insights',  icon: 'star' },
    { id: 'activity',  label: 'Activity',  icon: 'list' },
    { id: 'holdings',  label: 'Holdings',  icon: 'layers' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kova-mock', 'KOVA — Wealth Intelligence Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
