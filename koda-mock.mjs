import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KODA',
  tagline:   'Wealth Constellation Tracker',
  archetype: 'fintech-wealth',

  palette: {           // dark — deep space constellation
    bg:      '#080B12',
    surface: '#0E1320',
    text:    '#E8F0FE',
    accent:  '#00D4FF',
    accent2: '#8B5CF6',
    muted:   'rgba(140,160,210,0.55)',
  },

  lightPalette: {      // light — clean wealth dashboard
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0B1121',
    accent:  '#0099CC',
    accent2: '#6D28D9',
    muted:   'rgba(11,17,33,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$247,830', sub: '+$3,210 today · +1.31%' },
        { type: 'metric-row', items: [
          { label: 'Stocks', value: '$184K' },
          { label: 'Crypto', value: '$38K' },
          { label: 'Cash', value: '$25K' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'NVDA', sub: 'NVIDIA Corp · 14 shares', badge: '+7.24%' },
          { icon: 'chart',    title: 'ETH',  sub: 'Ethereum · 2.8 ETH',    badge: '−3.82%' },
          { icon: 'star',     title: 'AAPL', sub: 'Apple Inc · 48 shares',  badge: '+1.55%' },
        ]},
        { type: 'text', label: 'AI Signal', value: 'KODA AI sees a rebalancing opportunity — crypto 4% above target.' },
      ],
    },
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Value', value: '$247,830', sub: 'Across 4 accounts' },
        { type: 'progress', items: [
          { label: 'Equities', pct: 74 },
          { label: 'Crypto',   pct: 16 },
          { label: 'Cash & FI', pct: 10 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'NVDA',  sub: '14 shares · Equities',   badge: '+$892' },
          { icon: 'zap',   title: 'AAPL',  sub: '48 shares · Equities',   badge: '+$374' },
          { icon: 'layers',title: 'ETH',   sub: '2.8 ETH · Crypto',       badge: '−$314' },
          { icon: 'layers',title: 'BTC',   sub: '0.42 BTC · Crypto',      badge: '+$1,820' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Portfolio Health Score', value: '84 / 100', sub: 'Good — updated 2m ago' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Crypto Overweight',     sub: 'ETH+BTC at 19.3% vs 15% target — trim $10K', badge: 'ACTION' },
          { icon: 'chart', title: 'Tech Rally Exposure',   sub: 'Semiconductors +11% this month, NVDA +7.2%',  badge: 'INSIGHT' },
          { icon: 'check', title: 'Savings Rate On Track', sub: 'On schedule — 8 months ahead of 5yr goal',    badge: 'GOOD' },
          { icon: 'alert', title: 'ETH Drawdown Alert',    sub: 'Stop-loss at $2,600 approaching, now $2,847', badge: 'WATCH' },
        ]},
        { type: 'tags', label: 'Market Pulse', items: ['S&P +0.83%', 'NASDAQ +1.24%', 'CRYPTO −1.10%', 'VIX 18.4'] },
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income', value: '+$4,320' },
          { label: 'Spent',  value: '−$8,391' },
          { label: 'Net',    value: '−$4,071' },
        ]},
        { type: 'list', items: [
          { icon: 'chart',   title: 'NVDA Buy',          sub: 'Today 9:34 AM · Fidelity',       badge: 'INVEST' },
          { icon: 'share',   title: 'Robinhood Transfer', sub: 'Apr 12, 3:12 PM · Transfer',     badge: 'MOVE' },
          { icon: 'zap',     title: 'Salary Deposit',    sub: 'Apr 10, 12:00 AM · Chase',        badge: 'INCOME' },
          { icon: 'layers',  title: 'ETH Purchase',      sub: 'Apr 7, 5:47 PM · Coinbase',       badge: 'INVEST' },
          { icon: 'filter',  title: 'Amazon',            sub: 'Apr 6, 2:13 PM · Debit Card',     badge: 'SHOP' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'FIRE Target', value: '$1,000,000', sub: '24.8% complete · 8yr 4mo remaining' },
        { type: 'progress', items: [
          { label: 'Emergency Fund ($20K)',    pct: 68 },
          { label: 'Europe Trip Fund ($8K)',   pct: 88 },
          { label: 'House Down Payment ($80K)', pct: 32 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Student Loans Paid Off', sub: '$22,400 cleared · Mar 2026', badge: '✓ DONE' },
        ]},
        { type: 'text', label: 'Projection', value: 'At current savings rate, Emergency Fund done in 4.3 months. Europe Trip in 6 weeks.' },
      ],
    },
  ],

  nav: [
    { id: 'home',    label: 'Home',     icon: 'home' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'insights', label: 'Insights',  icon: 'zap' },
    { id: 'history', label: 'History',   icon: 'list' },
    { id: 'goals',   label: 'Goals',     icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'koda-mock', 'KODA — Wealth Constellation Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/koda-mock');
