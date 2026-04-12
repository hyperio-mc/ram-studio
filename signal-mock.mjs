import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'SIGNAL',
  tagline:   'Real-time market intelligence',
  archetype: 'finance-dark',
  palette: {
    bg:      '#050505',
    surface: '#0F0F0F',
    text:    '#EDE8DE',
    accent:  '#FF6B35',
    accent2: '#00C896',
    muted:   'rgba(237,232,222,0.38)',
  },
  lightPalette: {
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#E55A22',
    accent2: '#009B72',
    muted:   'rgba(26,22,20,0.45)',
  },
  screens: [
    {
      id: 'pulse', label: 'Market Pulse',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$284,910', sub: '+$1,847 today (+0.65%)' },
        { type: 'metric-row', items: [{ label: 'Day High', value: '287.2K' }, { label: 'Open', value: '283.1K' }, { label: 'Beta', value: '1.24' }] },
        { type: 'tags', label: 'Status', items: ['● MARKETS OPEN', 'NYSE', 'NASDAQ', 'CRYPTO 24/7'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'NVDA', sub: 'NVIDIA Corp. · $882.40', badge: '+4.2%' },
          { icon: 'chart', title: 'BTC', sub: 'Bitcoin · $67,340', badge: '+2.8%' },
          { icon: 'chart', title: 'TSLA', sub: 'Tesla Inc. · $179.82', badge: '-2.1%' },
        ]},
      ],
    },
    {
      id: 'watchlist', label: 'Watchlist',
      content: [
        { type: 'text', label: '12 assets tracked', value: 'Monitoring your curated list for breakouts, volume surges, and AI-detected patterns.' },
        { type: 'list', items: [
          { icon: 'star', title: 'AAPL', sub: 'Apple · $213.52', badge: '+1.2%' },
          { icon: 'star', title: 'NVDA', sub: 'NVIDIA · $882.40', badge: '+4.2%' },
          { icon: 'star', title: 'BTC', sub: 'Bitcoin · $67,340', badge: '+2.8%' },
          { icon: 'star', title: 'TSLA', sub: 'Tesla · $179.82', badge: '-2.1%' },
          { icon: 'star', title: 'ETH', sub: 'Ethereum · $3,521', badge: '+0.8%' },
        ]},
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'Active Signals', value: '4', sub: 'AI-detected patterns today' },
        { type: 'list', items: [
          { icon: 'zap', title: 'NVDA — Breakout', sub: 'Resistance break at $880 · 94% confidence', badge: 'BUY' },
          { icon: 'eye', title: 'BTC — Volume Surge', sub: 'Spot volume +340% · Whale accumulation', badge: 'WATCH' },
          { icon: 'alert', title: 'TSLA — Death Cross', sub: '50d MA crossing 200d MA · Bearish', badge: 'SELL' },
          { icon: 'check', title: 'META — Gap Fill', sub: 'Earnings gap fill target hit at $492', badge: 'NEUTRAL' },
        ]},
        { type: 'progress', items: [
          { label: 'NVDA Confidence', pct: 94 },
          { label: 'BTC Confidence', pct: 78 },
          { label: 'TSLA Confidence', pct: 62 },
        ]},
      ],
    },
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Value', value: '$284,910', sub: '+$1,847 (+0.65%) vs yesterday' },
        { type: 'metric-row', items: [{ label: 'US Stocks', value: '52%' }, { label: 'Crypto', value: '28%' }, { label: "Int'l", value: '12%' }, { label: 'Cash', value: '8%' }] },
        { type: 'list', items: [
          { icon: 'chart', title: 'BTC', sub: '1.2 units · $80,808 (28.4%)', badge: '+2.8%' },
          { icon: 'chart', title: 'AAPL', sub: '220 shares · $46,974 (16.5%)', badge: '+1.2%' },
          { icon: 'chart', title: 'ETH', sub: '14 units · $49,294 (17.3%)', badge: '+0.8%' },
          { icon: 'chart', title: 'NVDA', sub: '38 shares · $33,531 (11.8%)', badge: '+4.2%' },
          { icon: 'chart', title: 'TSLA', sub: '90 shares · $16,184 (5.7%)', badge: '-2.1%' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '6', sub: 'Smart notifications watching your portfolio' },
        { type: 'list', items: [
          { icon: 'bell', title: 'NVDA · Price Target', sub: 'Above $900.00', badge: 'ON' },
          { icon: 'bell', title: 'BTC · Volume Spike', sub: 'Daily vol > 2× avg', badge: 'ON' },
          { icon: 'bell', title: 'TSLA · Stop Loss', sub: 'Below $170.00', badge: 'ON' },
          { icon: 'bell', title: 'META · AI Signal', sub: 'Confidence > 80%', badge: 'OFF' },
          { icon: 'bell', title: 'Market Open', sub: '9:30 AM EST daily', badge: 'ON' },
        ]},
        { type: 'text', label: '⚡ PRO', value: 'Upgrade for unlimited alerts + real-time AI signals. First 3 months free.' },
      ],
    },
  ],
  nav: [
    { id: 'pulse',     label: 'Pulse',     icon: 'home' },
    { id: 'watchlist', label: 'Watch',     icon: 'star' },
    { id: 'signals',   label: 'Signals',  icon: 'zap' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'alerts',    label: 'Alerts',   icon: 'bell' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  
  // Save locally first
  fs.writeFileSync('signal-mock.html', html);
  console.log('✓ Mock HTML saved locally (signal-mock.html)');
  
  // Try to publish
  try {
    const result = await publishMock(html, 'signal-mock', 'SIGNAL — Interactive Mock');
    console.log('Mock live at:', result.url);
  } catch(e) {
    console.log('Note: ZenBin publish unavailable, mock saved locally');
  }
} catch(e) {
  console.error('Build error:', e.message);
  process.exit(1);
}
