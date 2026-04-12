import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HILT',
  tagline:   'Get a grip on your wealth',
  archetype: 'personal-finance',
  palette: {
    bg:      '#080F1C',
    surface: '#0D1830',
    text:    '#E8ECF4',
    accent:  '#D4A843',
    accent2: '#4DB6AC',
    muted:   'rgba(232,236,244,0.45)',
  },
  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0D1830',
    accent:  '#B8860B',
    accent2: '#2E8B7A',
    muted:   'rgba(13,24,48,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$247,830', sub: '↑ +1.32% today · ↑ +24.4% YTD' },
        { type: 'metric-row', items: [
          { label: 'Investments', value: '$184.2K' },
          { label: 'Savings', value: '$63.6K' },
          { label: 'Cash Flow', value: '+$3,170' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Monthly Income', sub: 'Direct deposits + dividends', badge: '+$8,400' },
          { icon: 'chart', title: 'Monthly Spend', sub: 'All categories combined', badge: '-$5,230' },
        ]},
        { type: 'progress', items: [
          { label: 'Invested', pct: 74 },
          { label: 'Emergency Fund', pct: 100 },
          { label: 'Annual Goal', pct: 62 },
        ]},
      ],
    },
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$184,200', sub: '↑ +4.1% YTD · 6 holdings' },
        { type: 'list', items: [
          { icon: 'chart', title: 'VTI — Vanguard Total', sub: '180 sh · $38,520', badge: '+1.8%' },
          { icon: 'zap',   title: 'NVDA — NVIDIA',       sub: '15 sh · $14,850',  badge: '+4.3%' },
          { icon: 'star',  title: 'AAPL — Apple Inc.',   sub: '42 sh · $9,240',   badge: '+2.1%' },
          { icon: 'layers',title: 'BRK.B — Berkshire',   sub: '88 sh · $31,240',  badge: '+0.5%' },
          { icon: 'grid',  title: 'BTC — Bitcoin',       sub: '0.42 BTC · $26,460',badge: '+5.1%' },
        ]},
        { type: 'progress', items: [
          { label: 'US Stocks', pct: 68 },
          { label: 'ETFs', pct: 21 },
          { label: 'Crypto', pct: 11 },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Gain', value: '+$36K' },
          { label: 'Return', value: '+24.4%' },
          { label: 'Best Day', value: '+$2,840' },
        ]},
        { type: 'text', label: 'vs. Benchmarks', value: 'Your portfolio +24.4% · S&P 500 +18.2% · NASDAQ +21.7%' },
        { type: 'progress', items: [
          { label: 'Your Portfolio', pct: 81 },
          { label: 'S&P 500', pct: 61 },
          { label: 'NASDAQ', pct: 72 },
        ]},
        { type: 'tags', label: 'Time Range', items: ['1W','1M','3M','6M','YTD','1Y'] },
        { type: 'text', label: '◈ Smart Insight', value: 'On pace to exceed last year\'s gains by 8%. Keep your current allocation.' },
      ],
    },
    {
      id: 'transactions', label: 'Transactions',
      content: [
        { type: 'metric', label: 'This Month', value: '-$5,230', sub: 'vs. budget of $6,000 · 34 transactions' },
        { type: 'list', items: [
          { icon: 'heart',    title: 'Salary Deposit',    sub: 'Apr 6 · Direct Deposit',  badge: '+$4,200' },
          { icon: 'star',     title: 'AAPL Dividend',     sub: 'Apr 5 · Brokerage',       badge: '+$124' },
          { icon: 'map',      title: 'Trader Joe\'s',     sub: 'Apr 5 · Groceries',       badge: '-$67' },
          { icon: 'play',     title: 'Chevron Gas',       sub: 'Apr 4 · Transport',       badge: '-$82' },
          { icon: 'message',  title: 'Blue Bottle Coffee',sub: 'Apr 4 · Food & Drink',    badge: '-$6.80' },
          { icon: 'check',    title: 'Spotify Premium',   sub: 'Apr 3 · Subscription',    badge: '-$9.99' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All','Food','Transport','Income','Invest'] },
      ],
    },
    {
      id: 'markets', label: 'Markets',
      content: [
        { type: 'text', label: 'Market Pulse', value: 'S&P 500 +0.82% · NASDAQ +1.14% · DOW -0.21% · VIX 14.2' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'NVDA — NVIDIA',   sub: '$989.80', badge: '+4.3%' },
          { icon: 'grid',     title: 'BTC — Bitcoin',   sub: '$63,000', badge: '+5.1%' },
          { icon: 'activity', title: 'META — Meta',     sub: '$542.30', badge: '+2.7%' },
          { icon: 'layers',   title: 'AMZN — Amazon',   sub: '$193.40', badge: '+0.9%' },
          { icon: 'alert',    title: 'TSLA — Tesla',    sub: '$241.60', badge: '-1.2%' },
          { icon: 'search',   title: 'GOOGL — Alphabet',sub: '$176.50', badge: '-0.4%' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All','Stocks','ETFs','Crypto','Owned'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Wealth Score', value: '847', sub: 'Excellent · Top 12% of users' },
        { type: 'metric-row', items: [
          { label: 'Member Since', value: 'Mar \'22' },
          { label: 'Total Trades', value: '847' },
          { label: 'Alerts Active', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',     title: 'Notifications',     sub: 'Alerts & price targets',    badge: '→' },
          { icon: 'lock',     title: 'Privacy & Security',sub: 'Biometrics, 2FA on',        badge: '→' },
          { icon: 'home',     title: 'Linked Accounts',   sub: 'Chase, Robinhood, Coinbase',badge: '→' },
          { icon: 'star',     title: 'HILT Premium',      sub: '$4.99/mo · Gold Tier',      badge: '→' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',    icon: 'home' },
    { id: 'portfolio',    label: 'Portfolio',icon: 'chart' },
    { id: 'transactions', label: 'Add',     icon: 'plus' },
    { id: 'markets',      label: 'Markets', icon: 'activity' },
    { id: 'profile',      label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'hilt-mock', 'HILT — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/hilt-mock');
