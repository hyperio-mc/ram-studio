import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Writ',
  tagline:   'Daily market intelligence, distilled',
  archetype: 'editorial-intelligence',
  palette: {
    bg:      '#090807',
    surface: '#111009',
    text:    '#F0EAE0',
    accent:  '#D4602A',
    accent2: '#4A8A72',
    muted:   'rgba(240,234,224,0.4)',
  },
  lightPalette: {
    bg:      '#F5F0E8',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#C45228',
    accent2: '#3A7260',
    muted:   'rgba(26,22,20,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'APR 08 · WED · 2026', value: 'WRIT', sub: 'Daily Market Intelligence' },
        { type: 'metric-row', items: [
          { label: 'SPX', value: '5,241' },
          { label: 'NDX', value: '18,340' },
          { label: 'BTC', value: '$84k' },
          { label: 'DXY', value: '103.4' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Fed signals pause on rate cuts', sub: 'MACRO · Reuters · 2h ago', badge: 'BEAR' },
          { icon: 'chart', title: 'NVDA breaks $1,100 on supply data', sub: 'EQUITY · Bloomberg · 45m ago', badge: 'BULL' },
          { icon: 'activity', title: 'BTC holds $84k — next resistance $91k', sub: 'CRYPTO · CoinDesk · 1h ago', badge: '' },
        ]},
        { type: 'text', label: 'IN DEPTH TODAY', value: '01 — Why the yield curve inversion matters now · FT · 8 min read' },
        { type: 'text', label: '', value: '02 — AI chip capex: separating signal from noise · Stratechery · 12 min' },
        { type: 'text', label: '', value: "03 — Private credit's quiet expansion into EM · Economist · 6 min" },
      ],
    },
    {
      id: 'markets', label: 'Markets',
      content: [
        { type: 'metric', label: 'S&P 500 · 1D', value: '5,241.30', sub: '-0.82% · -43.20 pts today' },
        { type: 'progress', items: [
          { label: 'Tech Sector', pct: 72 },
          { label: 'Energy', pct: 58 },
          { label: 'Healthcare', pct: 48 },
          { label: 'Finance', pct: 38 },
          { label: 'Utilities', pct: 24 },
        ]},
        { type: 'metric-row', items: [
          { label: 'NASDAQ', value: '+0.4%' },
          { label: 'BTC/USD', value: '+1.2%' },
          { label: 'GOLD', value: '+0.7%' },
          { label: 'EUR/USD', value: '-0.3%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Fear & Greed', value: '52' },
          { label: 'VIX', value: '22.4' },
        ]},
        { type: 'tags', label: 'SECTORS', items: ['Tech +1.4%', 'Energy +0.9%', 'Health +0.2%', 'Finance -0.5%', 'Utilities -1.1%'] },
      ],
    },
    {
      id: 'detail', label: 'Signal Detail',
      content: [
        { type: 'text', label: 'MACRO ANALYSIS · APR 08 · 07:32', value: 'Fed Signals Pause on Rate Cuts' },
        { type: 'text', label: 'Reuters Wire · Analyzed by Writ AI · 6 min read', value: 'Federal Reserve Chair Jerome Powell indicated Wednesday that the central bank is in no hurry to resume cutting rates, as inflation remains above target for a third consecutive quarter.' },
        { type: 'text', label: 'PULL QUOTE', value: '"The economy is strong enough that we can afford to be patient." — Jerome Powell, April 8 2026' },
        { type: 'list', items: [
          { icon: 'activity', title: '10Y Treasury Yield', sub: 'Key data point', badge: '+18bps' },
          { icon: 'check', title: 'Fed Funds Target', sub: 'Current range', badge: '4.75-5.00%' },
          { icon: 'alert', title: 'PCE Inflation (Feb)', sub: 'vs 2.0% target', badge: '+2.7% YoY' },
          { icon: 'calendar', title: 'Next FOMC Date', sub: 'Watch calendar', badge: 'May 7-8' },
        ]},
      ],
    },
    {
      id: 'watchlist', label: 'Watchlist',
      content: [
        { type: 'list', items: [
          { icon: 'star', title: 'NVDA  $1,082', sub: 'NVIDIA Corp · Goldman PT→$1340', badge: '+3.4%' },
          { icon: 'star', title: 'AAPL  $189.40', sub: 'Apple Inc · Watch WWDC June', badge: '-0.9%' },
          { icon: 'star', title: 'BTC  $84,140', sub: 'Bitcoin · Support held $82k', badge: '+1.2%' },
          { icon: 'star', title: 'TLT  $88.20', sub: '20Y+ Treasury · Watching $86', badge: '-1.8%' },
          { icon: 'star', title: 'DXY  103.42', sub: 'Dollar Index · Weakening', badge: '-0.2%' },
        ]},
        { type: 'tags', label: 'CATEGORIES', items: ['All', 'Equities', 'Crypto', 'Macro', 'FX'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Writ Pro · Since Jan 2025', value: 'Rakis', sub: 'Signal Score: 94/100 · Top 6% globally' },
        { type: 'progress', items: [
          { label: 'Signal accuracy', pct: 94 },
          { label: 'Reading streak (28d)', pct: 78 },
          { label: 'Watchlist coverage', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Delivery time', sub: 'Briefing schedule', badge: '7:00 AM ET' },
          { icon: 'filter', title: 'Signal focus', sub: 'Your preferences', badge: 'Equities + Crypto' },
          { icon: 'bell', title: 'Alert threshold', sub: 'Price movement trigger', badge: '±2.5%' },
          { icon: 'zap', title: 'Subscription', sub: 'Current plan', badge: 'Pro · $24/mo' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',     label: 'Today',    icon: 'home' },
    { id: 'markets',   label: 'Markets',  icon: 'chart' },
    { id: 'detail',    label: 'Signals',  icon: 'zap' },
    { id: 'watchlist', label: 'Watch',    icon: 'star' },
    { id: 'profile',   label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'writ-intel-mock', 'Writ — Interactive Mock');
console.log('Mock live at:', result.url);
