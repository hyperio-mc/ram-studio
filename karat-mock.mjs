import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KARAT',
  tagline:   'Wealth Intelligence Dashboard',
  archetype: 'fintech-wealth',
  palette: {
    bg:      '#0C0A1A',
    surface: '#12102A',
    text:    '#F1EFF9',
    accent:  '#7454FA',
    accent2: '#B28A4E',
    muted:   'rgba(160,156,192,0.45)',
  },
  lightPalette: {
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1A1633',
    accent:  '#6240E8',
    accent2: '#9A6E2E',
    muted:   'rgba(26,22,51,0.4)',
  },
  screens: [
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$284,720', sub: '+$3,210 this month · +1.1%' },
        { type: 'metric-row', items: [
          { label: 'Investments', value: '$198K' },
          { label: 'Cash', value: '$43K' },
          { label: 'Real Estate', value: '$43K' },
        ]},
        { type: 'progress', items: [
          { label: 'Equities', pct: 70 },
          { label: 'Cash Buffer', pct: 15 },
          { label: 'Real Estate', pct: 13 },
          { label: 'Crypto / Other', pct: 2 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'SPY', sub: '$521.4', badge: '+0.8%' },
          { icon: 'zap',      title: 'NVDA', sub: '$882.1', badge: '+2.1%' },
          { icon: 'chart',    title: 'BTC', sub: '$68.2K', badge: '-0.4%' },
        ]},
      ],
    },
    {
      id: 'holdings',
      label: 'Holdings',
      content: [
        { type: 'metric', label: 'Total Portfolio', value: '12 Positions', sub: '$284,720 total value' },
        { type: 'list', items: [
          { icon: 'chart',  title: 'VTI — Vanguard Total',    sub: '$243.18 · $98,420',  badge: '+1.2%' },
          { icon: 'zap',    title: 'NVDA — NVIDIA',           sub: '$882.10 · $44,105', badge: '+2.1%' },
          { icon: 'star',   title: 'AAPL — Apple',            sub: '$189.30 · $28,395', badge: '+0.4%' },
          { icon: 'layers', title: 'MSFT — Microsoft',        sub: '$415.60 · $20,780', badge: '-0.8%' },
          { icon: 'grid',   title: 'QQQ — Invesco',           sub: '$444.20 · $13,326', badge: '+0.6%' },
          { icon: 'eye',    title: 'CASH — Money Market',     sub: '$1.00 · $43,280',   badge: '0.0%' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'Stocks', 'ETF', 'Crypto', 'Cash'] },
      ],
    },
    {
      id: 'cashflow',
      label: 'Flow',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income', value: '$12.4K' },
          { label: 'Expenses', value: '$7.8K' },
          { label: 'Saved', value: '$4.6K' },
        ]},
        { type: 'metric', label: 'Savings Rate', value: '36.8%', sub: 'Top quartile · ↑ 4.2% vs March' },
        { type: 'progress', items: [
          { label: 'Salary',    pct: 85 },
          { label: 'Freelance', pct: 15 },
          { label: 'Housing',   pct: 68 },
          { label: 'Food',      pct: 29 },
          { label: 'Transport', pct: 16 },
          { label: 'Invest',    pct: 29 },
        ]},
        { type: 'tags', label: 'Period', items: ['Feb', 'Mar', 'Apr'] },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Active Goals', value: '4', sub: '1 completed · On track overall' },
        { type: 'progress', items: [
          { label: 'Emergency Fund ($30K)',  pct: 95 },
          { label: 'House Down Pmt ($80K)',  pct: 54 },
          { label: 'Retirement ($1M)',        pct: 20 },
          { label: 'Europe Trip ($8K)',       pct: 40 },
          { label: 'New Laptop (Done)',       pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Emergency Fund', sub: '$28,500 / $30,000', badge: '95%' },
          { icon: 'home',     title: 'House Down Pmt', sub: '$43,280 / $80,000', badge: '54%' },
          { icon: 'star',     title: 'Retirement 1M',  sub: '$198K / $1M',       badge: '20%' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Wealth Score', value: '86/100', sub: 'Excellent · Top 12% of users' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'Rebalancing Opportunity', sub: 'Move $7,900 to cash — equities 2.8% above target', badge: 'Action' },
          { icon: 'eye',      title: 'NVDA Concentration Risk', sub: 'NVDA is 22% of equities — consider trimming 5%',     badge: 'Risk' },
          { icon: 'zap',      title: 'Savings Milestone',       sub: '36%+ rate for 4 months · $54K on track for 2025',   badge: 'Win' },
          { icon: 'calendar', title: 'Tax-Loss Harvest',        sub: 'MSFT down 4.2% — harvest window before Apr 15',     badge: 'Tax' },
        ]},
        { type: 'tags', label: 'Categories', items: ['All', 'Actions', 'Risks', 'Milestones', 'Tax'] },
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      content: [
        { type: 'metric', label: 'YTD Return', value: '+14.2%', sub: 'vs S&P 500 +9.1% · outperforming by +5.1%' },
        { type: 'metric-row', items: [
          { label: 'Gain (YTD)', value: '+$34.6K' },
          { label: 'Sharpe',    value: '1.82' },
          { label: 'Beta',      value: '0.94' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'NVDA',  sub: 'NVIDIA Corporation', badge: '+48.2%' },
          { icon: 'chart',    title: 'VTI',   sub: 'Vanguard Total',     badge: '+12.8%' },
          { icon: 'activity', title: 'MSFT',  sub: 'Microsoft',          badge: '-4.2%' },
        ]},
        { type: 'progress', items: [
          { label: 'Max Drawdown  -8.4%', pct: 84 },
          { label: 'Volatility  12.1%',   pct: 60 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'portfolio',   label: 'Portfolio', icon: 'chart' },
    { id: 'holdings',    label: 'Holdings',  icon: 'layers' },
    { id: 'cashflow',    label: 'Flow',      icon: 'activity' },
    { id: 'goals',       label: 'Goals',     icon: 'star' },
    { id: 'insights',    label: 'Insights',  icon: 'zap' },
    { id: 'performance', label: 'Perf',      icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'karat-mock', 'KARAT — Wealth Dashboard Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/karat-mock`);
