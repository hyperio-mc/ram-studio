import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'AUREA',
  tagline:   'Wealth, in plain sight',
  archetype: 'finance-editorial',
  palette: {
    bg:      '#1A160E',
    surface: '#241F16',
    text:    '#F4F0E6',
    accent:  '#D4551A',
    accent2: '#3D8A65',
    muted:   'rgba(244,240,230,0.40)',
  },
  lightPalette: {
    bg:      '#F4F0E6',
    surface: '#FEFCF8',
    text:    '#120E07',
    accent:  '#B8400E',
    accent2: '#2D6B4E',
    muted:   'rgba(18,14,7,0.40)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Net Worth', value: '$284,710', sub: '▲ +$1,204 · +0.43% today' },
        { type: 'metric-row', items: [
          { label: 'Investments', value: '$198.4K' },
          { label: 'Cash',        value: '$54.2K'  },
          { label: 'Real Estate', value: '$32.1K'  },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Apple Inc.',        sub: 'AAPL · 22% of portfolio', badge: '+1.2%'  },
          { icon: 'activity', title: 'Bitcoin',           sub: 'BTC · 18% of portfolio',  badge: '+3.4%'  },
          { icon: 'chart',    title: 'Vanguard S&P 500',  sub: 'VOO · 15% of portfolio',  badge: '+0.6%'  },
          { icon: 'alert',    title: 'Amazon.com',         sub: 'AMZN · 11% of portfolio', badge: '-0.8%'  },
        ]},
        { type: 'text', label: '30-Day Performance', value: 'Portfolio gained +6.2% over the past 30 days, outperforming the S&P 500 benchmark by 2.1 percentage points.' },
      ],
    },
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: '12 Positions', value: '$284,710', sub: 'Total portfolio value' },
        { type: 'tags', label: 'Filter', items: ['All', 'Stocks', 'Crypto', 'ETFs', 'Cash'] },
        { type: 'list', items: [
          { icon: 'chart',   title: 'AAPL · Apple Inc.',       sub: '$56,230 · 22% alloc', badge: '+18.4%' },
          { icon: 'zap',     title: 'BTC · Bitcoin',           sub: '$51,180 · 18% alloc', badge: '+84.2%' },
          { icon: 'chart',   title: 'VOO · Vanguard S&P 500',  sub: '$42,810 · 15% alloc', badge: '+24.1%' },
          { icon: 'alert',   title: 'AMZN · Amazon.com',        sub: '$31,350 · 11% alloc', badge: '+9.3%'  },
          { icon: 'chart',   title: 'MSFT · Microsoft Corp.',   sub: '$28,480 · 10% alloc', badge: '+22.7%' },
        ]},
        { type: 'progress', items: [
          { label: 'Stocks',       pct: 43 },
          { label: 'Cash',         pct: 19 },
          { label: 'Crypto',       pct: 18 },
          { label: 'ETFs',         pct: 15 },
          { label: 'Real Estate',  pct: 5  },
        ]},
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'metric', label: 'Recent Transactions', value: '7', sub: 'in the past 30 days' },
        { type: 'list', items: [
          { icon: 'plus',    title: 'Bought AAPL',       sub: '25 shares @ $224.88 · Mar 27',  badge: '-$5,622' },
          { icon: 'heart',   title: 'Dividend VOO',      sub: 'Vanguard ETF · Mar 25',          badge: '+$84.20' },
          { icon: 'share',   title: 'Sold AMZN',         sub: '5 shares @ $192.40 · Mar 22',   badge: '+$962'   },
          { icon: 'plus',    title: 'Bought BTC',        sub: '0.12 BTC @ $87,200 · Mar 18',   badge: '-$10,464'},
          { icon: 'heart',   title: 'Dividend AAPL',     sub: 'Apple Inc. · Feb 28',            badge: '+$22.40' },
          { icon: 'plus',    title: 'Bought MSFT',       sub: '10 shares @ $414.20 · Feb 14',  badge: '-$4,142' },
          { icon: 'check',   title: 'Deposit',           sub: 'Bank transfer · Feb 3',          badge: '+$2,500' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'YTD Return', value: '+14.2%', sub: 'vs. S&P 500 benchmark of +8.4%' },
        { type: 'metric-row', items: [
          { label: '1-Year Return', value: '+28.6%' },
          { label: 'Sharpe Ratio',  value: '1.82'   },
          { label: 'Volatility',    value: '12.4%'  },
        ]},
        { type: 'progress', items: [
          { label: 'Stocks — 43%',       pct: 43 },
          { label: 'Cash — 19%',         pct: 19 },
          { label: 'Crypto — 18%',       pct: 18 },
          { label: 'ETFs — 15%',         pct: 15 },
          { label: 'Real Estate — 5%',   pct: 5  },
        ]},
        { type: 'text', label: 'Market Insight', value: 'Your crypto position is 18% of AUM — approaching the 20% rebalance threshold you set. Consider rebalancing toward bonds or cash equivalents.' },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Active Goals', value: '4', sub: '2 on track · 1 ahead · 1 building' },
        { type: 'progress', items: [
          { label: 'House Down Payment — 64%', pct: 64 },
          { label: 'Japan Trip Fund — 78%',    pct: 78 },
          { label: 'Emergency Reserve — 50%',  pct: 50 },
          { label: 'Roth IRA — 42%',           pct: 42 },
        ]},
        { type: 'list', items: [
          { icon: 'home',     title: 'House Down Payment', sub: '$38,400 of $60,000 · Dec 2026',  badge: '64%' },
          { icon: 'star',     title: 'Japan Trip Fund',    sub: '$6,200 of $8,000 · Sep 2026',    badge: '78%' },
          { icon: 'lock',     title: 'Emergency Reserve',  sub: '$12,500 of $25,000 · Ongoing',   badge: '50%' },
          { icon: 'calendar', title: 'Roth IRA',           sub: '$84,710 of $200,000 · 2040',     badge: '42%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home'   },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart'  },
    { id: 'activity',  label: 'Activity',  icon: 'list'   },
    { id: 'insights',  label: 'Insights',  icon: 'eye'    },
    { id: 'goals',     label: 'Goals',     icon: 'star'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'aurea-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
