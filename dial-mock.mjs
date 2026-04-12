import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DIAL',
  tagline:   'Market intelligence, terminal-grade.',
  archetype: 'fintech-ai-terminal',
  palette: {           // dark theme (required)
    bg:      '#07090F',
    surface: '#111827',
    text:    '#E2E8F0',
    accent:  '#00D4FF',
    accent2: '#10D988',
    muted:   'rgba(100,116,139,0.56)',
  },
  lightPalette: {      // light theme
    bg:      '#F1F5F9',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#059669',
    muted:   'rgba(15,23,42,0.4)',
  },
  screens: [
    {
      id: 'markets',
      label: 'Markets',
      content: [
        { type: 'metric-row', items: [
          { label: 'S&P 500', value: '5,842' },
          { label: 'NASDAQ',  value: '18,224' },
          { label: 'BTC',     value: '$87.4K' },
        ]},
        { type: 'metric', label: 'AI Signals Today', value: '3', sub: 'High-confidence alerts ready' },
        { type: 'list', items: [
          { icon: 'activity', title: 'NVDA',   sub: 'NVIDIA Corp — $892.40',   badge: '+4.12%' },
          { icon: 'activity', title: 'META',   sub: 'Meta Platforms — $518.60', badge: '+3.31%' },
          { icon: 'activity', title: 'AMZN',   sub: 'Amazon.com — $186.10',    badge: '+1.97%' },
          { icon: 'alert',    title: 'TSLA',   sub: 'Tesla Inc — $174.20',      badge: '-2.84%' },
        ]},
        { type: 'tags', label: 'Sector Heat', items: ['TECH +2.1%', 'FINC +1.2%', 'ENRG +0.8%', 'HLTH -0.4%', 'INDU -1.1%'] },
      ],
    },
    {
      id: 'signals',
      label: 'Signals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Bullish', value: '7' },
          { label: 'Neutral', value: '3' },
          { label: 'Bearish', value: '4' },
          { label: 'High Conf', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'NVDA LONG 4H',   sub: 'Conf: 92% · Entry $880 · Target $940',  badge: '▲ 92%' },
          { icon: 'zap',    title: 'META LONG 1D',   sub: 'Conf: 87% · Entry $505 · Target $545',  badge: '▲ 87%' },
          { icon: 'alert',  title: 'TSLA SHORT 1D',  sub: 'Conf: 78% · Entry $178 · Target $158',  badge: '▼ 78%' },
          { icon: 'zap',    title: 'BTC LONG 1W',    sub: 'Conf: 84% · Entry $85K · Target $95K',  badge: '▲ 84%' },
        ]},
        { type: 'text', label: 'DIAL-α Model', value: 'Transformer-based market pattern recognition. v2.4.1 — Trained Apr 2026 — 94.2% accuracy on backtested signals.' },
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Value', value: '$128,420', sub: '+$14,820 total return (+13.06%)' },
        { type: 'metric-row', items: [
          { label: 'Today', value: '+$820' },
          { label: 'Return', value: '+13.1%' },
        ]},
        { type: 'progress', items: [
          { label: 'Equities (58%)', pct: 58 },
          { label: 'Crypto (22%)',   pct: 22 },
          { label: 'ETF/Index (12%)',pct: 12 },
          { label: 'Bonds (5%)',     pct: 5  },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'NVDA',  sub: '24 shares · $21,418', badge: '+4.12%' },
          { icon: 'chart', title: 'BTC',   sub: '0.5 BTC · $43,710',   badge: '+2.87%' },
          { icon: 'chart', title: 'SPY',   sub: '60 shares · $31,062',  badge: '+1.24%' },
          { icon: 'chart', title: 'META',  sub: '35 shares · $18,151',  badge: '+3.31%' },
        ]},
      ],
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      content: [
        { type: 'metric-row', items: [
          { label: 'Tracked', value: '24' },
          { label: 'Gainers', value: '15' },
          { label: 'Losers',  value: '9'  },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'NVDA', sub: '$892.40 · 7d chart ↗',   badge: '+4.12%' },
          { icon: 'eye', title: 'ETH',  sub: '$3,214 · 7d chart ↗',     badge: '+5.22%' },
          { icon: 'eye', title: 'MSFT', sub: '$418.60 · 7d chart ↗',   badge: '+1.48%' },
          { icon: 'eye', title: 'BTC',  sub: '$87,420 · 7d chart ↗',   badge: '+2.87%' },
          { icon: 'alert',title: 'TSLA',sub: '$174.20 · 7d chart ↘',   badge: '-2.84%' },
          { icon: 'alert',title: 'GOOGL',sub: '$181.40 · 7d chart ↘',  badge: '-0.52%' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'Stocks', 'Crypto', 'ETF', 'Forex'] },
      ],
    },
    {
      id: 'feed',
      label: 'Feed',
      content: [
        { type: 'metric-row', items: [
          { label: 'Alerts', value: '12' },
          { label: 'Signals', value: '5' },
          { label: 'News', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'NVDA breakout confirmed',       sub: 'SIGNAL · 09:32 · Conf 92% · Price crossed $880 resistance', badge: '▲' },
          { icon: 'alert',    title: 'TSLA -3% alert triggered',      sub: 'PRICE · 09:18 · Your stop-watch triggered at $178',          badge: '▼' },
          { icon: 'star',     title: 'BTC weekly signal active',      sub: 'SIGNAL · 09:05 · Post-halving accumulation phase',           badge: '◈' },
          { icon: 'bell',     title: 'Fed minutes: rates on hold',    sub: 'NEWS · 08:47 · No change through Q3 2026',                   badge: '◉' },
          { icon: 'check',    title: 'ETH $3,200 target hit',         sub: 'PRICE · 08:30 · 41% gain from entry',                        badge: '⬡' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'markets',   label: 'Markets',   icon: 'activity' },
    { id: 'signals',   label: 'Signals',   icon: 'zap' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'watchlist', label: 'Watch',     icon: 'eye' },
    { id: 'feed',      label: 'Feed',      icon: 'bell' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'dial');
const result = await publishMock(built, 'dial-mock', 'DIAL — Market Intelligence Terminal');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/dial-mock`);
