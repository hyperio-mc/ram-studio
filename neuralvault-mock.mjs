import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'NeuralVault',
  tagline: 'AI-Powered DeFi Portfolio Intelligence.',
  archetype: 'finance',
  palette: {
    bg:      '#0A0B0F',
    surface: '#111318',
    text:    '#E8EAF0',
    accent:  '#00FF88',
    accent2: '#00D4FF',
    muted:   'rgba(123,128,153,0.5)',
  },
  screens: [
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Portfolio Value', value: '$247,831', sub: '+$4,218 · +1.73% today · AI Active ⚡' },
        { type: 'metric-row', items: [
          { label: 'BTC', value: '$89,420' },
          { label: 'ETH', value: '$64,180' },
          { label: 'Yield APY', value: '12.8%' },
        ]},
        { type: 'tags', label: 'AI Signal', items: ['↗ BTC Breakout', '⚡ High Confidence', '87%'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Bought BTC', sub: 'Market order · 2m ago', badge: '+0.012 BTC' },
          { icon: 'activity', title: 'Sold ETH', sub: 'Limit order · 1h ago', badge: '-0.5 ETH' },
          { icon: 'alert', title: 'AI Signal', sub: 'SOL reversal · 3h ago', badge: '87% conf.' },
        ]},
      ],
    },
    {
      id: 'markets', label: 'Markets',
      content: [
        { type: 'metric-row', items: [
          { label: 'BTC Dom', value: '52.3%' },
          { label: 'Fear/Greed', value: '72' },
          { label: 'AI Bias', value: '🟢 Bull' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Bitcoin  BTC', sub: '$67,824', badge: '+2.41%' },
          { icon: 'chart', title: 'Ethereum  ETH', sub: '$3,580', badge: '+0.87%' },
          { icon: 'chart', title: 'Solana  SOL', sub: '$182.40', badge: '-1.23%' },
          { icon: 'chart', title: 'Arbitrum  ARB', sub: '$1.840', badge: '+5.12%' },
          { icon: 'zap', title: 'Pendle  PENDLE', sub: '$5.420', badge: '+8.33% 🔥' },
          { icon: 'chart', title: 'Chainlink  LINK', sub: '$18.62', badge: '-0.44%' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Trending 🔥', 'AI Picks ⚡', 'DeFi', 'Layer 1'] },
      ],
    },
    {
      id: 'trade', label: 'Trade',
      content: [
        { type: 'metric', label: 'Swapping', value: '0.0350 BTC', sub: 'For approximately 0.6621 ETH · ≈ $2,373.84' },
        { type: 'progress', items: [
          { label: 'Neural Confidence', pct: 87 },
          { label: 'Market Timing', pct: 73 },
          { label: 'Liquidity Score', pct: 91 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Exchange Rate', sub: '1 BTC = 18.92 ETH', badge: 'Live' },
          { icon: 'check', title: 'Price Impact', sub: 'Minimal impact detected', badge: '< 0.01%' },
          { icon: 'zap', title: 'AI Route', sub: 'Uniswap V4 → Curve', badge: 'Optimal' },
        ]},
        { type: 'text', label: 'AI Recommendation', value: 'Strong neural confidence (87%) detected for this swap. Market timing indicator at 73% — favorable entry window. Execute within 4 minutes for optimal rate.' },
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: 'Portfolio Gain · March 2026', value: '+$24,182', sub: '+10.8% this month · Outperforming BTC by 3.2x' },
        { type: 'metric-row', items: [
          { label: 'Sharpe Ratio', value: '2.84' },
          { label: 'Win Rate', value: '68.4%' },
          { label: 'Max Drawdown', value: '-8.2%' },
        ]},
        { type: 'progress', items: [
          { label: 'BTC (36%)', pct: 36 },
          { label: 'ETH (26%)', pct: 26 },
          { label: 'SOL (20%)', pct: 20 },
          { label: 'ARB (10%)', pct: 10 },
          { label: 'Other (8%)', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Avg Hold Time', sub: 'Across all positions', badge: '4.2 days' },
          { icon: 'star', title: 'Best Trade', sub: 'PENDLE long · March 12', badge: '+34.2%' },
          { icon: 'alert', title: 'Worst Trade', sub: 'SOL short · March 8', badge: '-6.1%' },
        ]},
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'AI Engine Status', value: '8 Active', sub: 'NeuralVault AI · Processing 2.4M data points · 99.98% uptime' },
        { type: 'list', items: [
          { icon: 'zap', title: '↗ BTC LONG', sub: 'Breakout above $67K resistance', badge: '87% conf' },
          { icon: 'zap', title: '↗ PENDLE LONG', sub: 'Yield TVL surge — DeFi rotation', badge: '91% conf' },
          { icon: 'activity', title: '→ ETH NEUTRAL', sub: 'Consolidation — awaiting catalyst', badge: '62% conf' },
          { icon: 'alert', title: '↘ SOL SHORT', sub: 'RSI divergence at resistance', badge: '78% conf' },
        ]},
        { type: 'progress', items: [
          { label: 'BTC Signal Strength', pct: 87 },
          { label: 'PENDLE Signal Strength', pct: 91 },
          { label: 'SOL Signal Strength', pct: 78 },
        ]},
        { type: 'tags', label: 'Signal Types', items: ['⚡ AI Long', '↘ AI Short', '→ Neutral', '🔥 Trending'] },
      ],
    },
  ],
  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'markets',   label: 'Markets',   icon: 'activity' },
    { id: 'trade',     label: 'Trade',     icon: 'zap' },
    { id: 'analytics', label: 'Analytics', icon: 'layers' },
    { id: 'signals',   label: 'Signals',   icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('⚡ Building NeuralVault Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('✓ Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'neuralvault-mock', 'NeuralVault — Interactive Mock');
console.log('✅ Mock live at:', result.url);
