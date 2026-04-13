import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PARED',
  tagline:   'personal finance, stripped bare',
  archetype: 'personal-finance',

  // Dark palette (required)
  palette: {
    bg:      '#1A1818',
    surface: '#242220',
    text:    '#F8F6F2',
    accent:  '#AAFB5C',
    accent2: '#7A7875',
    muted:   'rgba(248,246,242,0.4)',
  },

  // Light palette (the canonical PARED look)
  lightPalette: {
    bg:      '#F8F6F2',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#AAFB5C',
    accent2: '#3D3B38',
    muted:   'rgba(26,24,24,0.45)',
  },

  screens: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$142,816', sub: '+8.4% YTD · +$2,140 this month' },
        { type: 'metric-row', items: [
          { label: 'Equities', value: '53%' },
          { label: 'Crypto',   value: '22%' },
          { label: 'Bonds',    value: '15%' },
          { label: 'Cash',     value: '10%' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'AAPL · Apple Inc.',      sub: '28% allocation',  badge: '+1.2%' },
          { icon: 'zap',   title: 'BTC · Bitcoin',           sub: '22% allocation',  badge: '+4.7%' },
          { icon: 'layers',title: 'VWCE · Vanguard FTSE',   sub: '19% allocation',  badge: '+0.8%' },
          { icon: 'activity',title:'TSLA · Tesla Inc.',      sub: '14% allocation',  badge: '-2.1%' },
          { icon: 'grid',  title: 'MSFT · Microsoft Corp.', sub: '11% allocation',  badge: '+0.4%' },
        ]},
      ],
    },
    {
      id: 'allocation',
      label: 'Allocation',
      content: [
        { type: 'metric', label: 'Total Invested', value: '$134,247', sub: 'Across 6 asset classes' },
        { type: 'progress', items: [
          { label: 'US Equities',   pct: 53 },
          { label: 'Crypto Assets', pct: 22 },
          { label: 'Fixed Income',  pct: 15 },
          { label: 'Cash Reserves', pct: 10 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sharpe Ratio', value: '1.42' },
          { label: 'Beta',         value: '0.87' },
          { label: 'Volatility',   value: '16.3%' },
          { label: 'Max DD',       value: '-11.2%' },
        ]},
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Month Spent', value: '-$7,730' },
          { label: 'Received',         value: '+$5,924' },
        ]},
        { type: 'list', items: [
          { icon: 'plus',   title: 'Bought AAPL · Apr 10',   sub: '+18 shares',   badge: '-$3,240' },
          { icon: 'heart',  title: 'Dividend VWCE · Apr 8',  sub: 'Q1 2026',      badge: '+$124'   },
          { icon: 'share',  title: 'Sold NVDA · Apr 5',      sub: '-12 shares',   badge: '+$5,800' },
          { icon: 'plus',   title: 'Bought BTC · Apr 2',     sub: '+0.02 BTC',    badge: '-$1,500' },
          { icon: 'plus',   title: 'Bought MSFT · Apr 1',    sub: '+3 shares',    badge: '-$890'   },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'Market Note', value: 'Tech equities outperform benchmark by 14.2% YTD. Your portfolio beats benchmark by 2.8 percentage points.' },
        { type: 'metric-row', items: [
          { label: 'vs Benchmark', value: '+2.8%' },
          { label: 'YTD Return',   value: '+8.4%' },
          { label: 'Realised P&L', value: '+$5,800' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Rebalance Crypto',   sub: 'BTC exceeds target by 4.2%',           badge: 'Action' },
          { icon: 'star',  title: 'Dividend Reinvest',  sub: '$124 VWCE dividend available',          badge: 'Income' },
          { icon: 'check', title: 'Tax-Loss Harvest',   sub: 'TSLA shows -$340 unrealised loss',      badge: 'Tax'    },
        ]},
        { type: 'tags', label: 'Portfolio Tags', items: ['Growth', 'Tech-heavy', 'Long-term', 'Low-turnover'] },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Goals on Track', value: '3 / 4', sub: 'Emergency Fund 94% complete' },
        { type: 'progress', items: [
          { label: 'House Deposit · Dec 2026',   pct: 64 },
          { label: 'Emergency Fund · Jul 2026',  pct: 94 },
          { label: 'Travel Fund · Sep 2026',     pct: 40 },
          { label: 'Retirement · 2045',          pct: 29 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Saved',   value: '$203,166' },
          { label: 'Total Targets', value: '$588,000' },
        ]},
        { type: 'text', label: 'Next Milestone', value: 'Emergency Fund completes in ~3 weeks at current savings rate of $625/month.' },
      ],
    },
  ],

  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'chart'    },
    { id: 'allocation', label: 'Allocate', icon: 'layers'   },
    { id: 'activity',   label: 'Activity', icon: 'activity' },
    { id: 'insights',   label: 'Insights', icon: 'eye'      },
    { id: 'goals',      label: 'Goals',    icon: 'star'     },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'pared-mock', 'PARED — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/pared-mock`);
