// gild-mock.mjs — Svelte interactive mock for GILD
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GILD',
  tagline:   'Wealth, observed.',
  archetype: 'wealth-intelligence',

  palette: {            // DARK theme
    bg:      '#0C0C0A',
    surface: '#1D1D19',
    text:    '#E8E4DC',
    accent:  '#C9A96E',
    accent2: '#5A8A6A',
    muted:   'rgba(232,228,220,0.40)',
  },

  lightPalette: {       // LIGHT theme
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#1A1810',
    accent:  '#8A6E3A',
    accent2: '#3A6A4A',
    muted:   'rgba(26,24,16,0.45)',
  },

  screens: [
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'NET WORTH', value: '$847,240', sub: '↑ +$14,820 (+1.78%) · 30-day' },
        { type: 'metric-row', items: [
          { label: 'YTD RETURN', value: '+22.4%' },
          { label: 'DIVIDEND',   value: '$2,140' },
          { label: 'CASH FLOW',  value: '+$810'  },
        ]},
        { type: 'progress', items: [
          { label: 'Equities',     pct: 62 },
          { label: 'Fixed Income', pct: 18 },
          { label: 'Private Alts', pct: 12 },
          { label: 'Cash & Other', pct:  8 },
        ]},
        { type: 'text', label: 'PORTFOLIO PERFORMANCE', value: '+$127,240 (+17.7%) since inception — 12 holdings across 4 asset classes.' },
      ],
    },
    {
      id: 'assets', label: 'Assets',
      content: [
        { type: 'text', label: 'HOLDINGS', value: '12 positions across equities, fixed income, alternatives, and cash.' },
        { type: 'list', items: [
          { icon: 'chart', title: 'AAPL',  sub: 'Apple Inc. · 16.9% weight',   badge: '+2.3%' },
          { icon: 'chart', title: 'MSFT',  sub: 'Microsoft Corp. · 11.6%',      badge: '+1.8%' },
          { icon: 'chart', title: 'BRK.B', sub: 'Berkshire Hathaway · 10.3%',   badge: '-0.4%' },
          { icon: 'chart', title: 'VTI',   sub: 'Vanguard Total Mkt · 9.0%',    badge: '+0.9%' },
          { icon: 'chart', title: 'AGG',   sub: 'iShares Bond ETF · 7.6%',      badge: '+0.2%' },
          { icon: 'chart', title: 'QQQ',   sub: 'Invesco Nasdaq-100 · 5.8%',    badge: '+3.1%' },
        ]},
      ],
    },
    {
      id: 'markets', label: 'Markets',
      content: [
        { type: 'metric', label: "TODAY'S P&L", value: '+$6,178', sub: '+0.73% · Apr 4, 2026' },
        { type: 'metric-row', items: [
          { label: 'S&P 500',  value: '+0.34%' },
          { label: 'NASDAQ',   value: '-0.12%' },
          { label: 'DOW',      value: '+0.22%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'AAPL',  sub: 'Apple Inc.',          badge: '+$3,286' },
          { icon: 'activity', title: 'QQQ',   sub: 'Invesco Nasdaq-100',  badge: '+$1,524' },
          { icon: 'activity', title: 'MSFT',  sub: 'Microsoft Corp.',     badge: '+$1,772' },
          { icon: 'activity', title: 'BRK.B', sub: 'Berkshire Hathaway',  badge: '-$349'   },
        ]},
      ],
    },
    {
      id: 'returns', label: 'Returns',
      content: [
        { type: 'metric', label: '1-YEAR RETURN', value: '+22.4%', sub: 'vs S&P 500 +18.2% · outperforming by 4.2%' },
        { type: 'progress', items: [
          { label: 'Your Portfolio',  pct: 75 },
          { label: 'S&P 500',         pct: 61 },
          { label: 'NASDAQ 100',      pct: 87 },
          { label: 'Bonds (AGG)',      pct: 16 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',  title: 'Capital Gains',   sub: 'Growth in holdings',        badge: '+18.6%' },
          { icon: 'star', title: 'Dividends',        sub: 'Yield on cost 3.1%',        badge: '+2.8%'  },
          { icon: 'zap',  title: 'Rebalancing',      sub: '3 rebalances YTD',          badge: '+1.0%'  },
        ]},
        { type: 'text', label: 'RISK METRICS', value: 'Sharpe 1.42 · Max Drawdown -6.8% · Volatility 12.3%' },
      ],
    },
    {
      id: 'ledger', label: 'Ledger',
      content: [
        { type: 'metric', label: 'APRIL 2026', value: '+$142.80', sub: 'Net flow this month (dividends)' },
        { type: 'list', items: [
          { icon: 'star',   title: 'SCHD · DIV',  sub: 'Apr 3 · Dividend reinvested',        badge: '+$142.80' },
          { icon: 'plus',   title: 'VTI · BUY',   sub: 'Apr 1 · 4 shares @ $242.50',         badge: '-$970.00' },
          { icon: 'star',   title: 'AGG · DIV',   sub: 'Mar 28 · Bond interest',             badge: '+$88.40'  },
          { icon: 'share',  title: 'BRK.B · SELL',sub: 'Mar 25 · 2 shares @ $448.20',        badge: '+$896.40' },
          { icon: 'plus',   title: 'AAPL · BUY',  sub: 'Mar 22 · 3 shares @ $172.90',        badge: '-$518.70' },
          { icon: 'plus',   title: 'MSFT · BUY',  sub: 'Mar 18 · 2 shares @ $409.60',        badge: '-$819.20' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'chart'    },
    { id: 'assets',    label: 'Assets',    icon: 'layers'   },
    { id: 'markets',   label: 'Markets',   icon: 'activity' },
    { id: 'returns',   label: 'Returns',   icon: 'zap'      },
    { id: 'ledger',    label: 'Ledger',    icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'gild-mock', 'GILD — Interactive Mock');
console.log('Mock live at:', result.url);
