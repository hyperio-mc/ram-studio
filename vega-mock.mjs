import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VEGA',
  tagline:   'AI-Powered DeFi Portfolio Intelligence',
  archetype: 'finance',
  palette: {
    bg:      '#070B12',
    surface: '#0E1420',
    text:    '#E8EBF0',
    accent:  '#6C47FF',
    accent2: '#00D4AA',
    muted:   'rgba(138, 148, 166, 0.5)',
  },
  screens: [
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Portfolio', value: '$148,294', sub: '+2.19% today (+$3,182)' },
        { type: 'metric-row', items: [
          { label: 'Best 24H',  value: 'SOL +8.4%' },
          { label: 'Positions', value: '14 Assets' },
          { label: 'AI Signal', value: '◈ BUY 87%' },
        ]},
        { type: 'progress', items: [
          { label: 'Bitcoin (BTC)', pct: 32 },
          { label: 'Ethereum (ETH)', pct: 26 },
          { label: 'Solana (SOL)', pct: 19 },
          { label: 'USDC', pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'BTC  +1.2%', sub: '$67,420 · Holdings $48,100', badge: '▲ Gain' },
          { icon: 'chart', title: 'ETH  +3.4%', sub: '$3,890  · Holdings $38,900', badge: '▲ Gain' },
          { icon: 'chart', title: 'SOL  +8.4%', sub: '$189.40 · Holdings $28,410', badge: '▲ Gain' },
          { icon: 'layers', title: 'USDC  0.0%', sub: '$1.00   · Holdings $18,000', badge: '— Stable' },
        ]},
      ],
    },
    {
      id: 'markets', label: 'Markets',
      content: [
        { type: 'metric-row', items: [
          { label: 'Market Cap', value: '$2.84T' },
          { label: 'BTC Dom',   value: '52.4%' },
          { label: 'Fear/Greed', value: '74 Greed' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'DeFi', 'Layer 1', 'Gaming', 'AI'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'BTC  Bitcoin',    sub: '$67,420', badge: '+1.20%' },
          { icon: 'star',  title: 'ETH  Ethereum',   sub: '$3,890',  badge: '+3.42%' },
          { icon: 'zap',   title: 'SOL  Solana',     sub: '$189.40', badge: '+8.39%' },
          { icon: 'chart', title: 'BNB  BNB Chain',  sub: '$618',    badge: '-1.08%' },
          { icon: 'chart', title: 'XRP  Ripple',     sub: '$0.824',  badge: '+0.62%' },
          { icon: 'alert', title: 'ADA  Cardano',    sub: '$0.681',  badge: '-3.24%' },
        ]},
      ],
    },
    {
      id: 'trade', label: 'Trade',
      content: [
        { type: 'metric', label: 'ETH / USDC', value: '$3,890.42', sub: '+$129.80 (+3.42%) today' },
        { type: 'tags', label: 'Order Type', items: ['Swap', 'Limit', 'DCA'] },
        { type: 'metric-row', items: [
          { label: 'From',    value: '1.25 ETH' },
          { label: 'Rate',    value: '≈ 3,882' },
          { label: 'To',      value: '4,853 USDC' },
        ]},
        { type: 'text', label: '◈ AI Route', value: 'Best route via Uniswap V4 + 1inch. Saves $14.20 vs direct swap.' },
        { type: 'progress', items: [
          { label: 'Uniswap V4', pct: 65 },
          { label: '1inch',      pct: 35 },
        ]},
        { type: 'text', label: 'Slippage', value: '0.5% max slippage · Gas: ~$3.20 · Est. time: 12s' },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'Market Sentiment', value: 'BULLISH', sub: '75% confidence · Updated 2m ago' },
        { type: 'list', items: [
          { icon: 'zap',   title: 'BTC — STRONG BUY',  sub: 'RSI reversal + whale accumulation. Target $74,200', badge: '87%' },
          { icon: 'zap',   title: 'SOL — BUY',         sub: 'Network ATH + DeFi TVL +28% MoM. Target $220',    badge: '74%' },
          { icon: 'alert', title: 'BNB — SELL',         sub: 'Rejection at $625 resistance. Risk-off signal.',   badge: '68%' },
          { icon: 'check', title: 'ETH — HOLD',         sub: 'Consolidation pre-EIP. Watch for $4,050 break.',  badge: '61%' },
        ]},
        { type: 'progress', items: [
          { label: 'BTC Confidence', pct: 87 },
          { label: 'SOL Confidence', pct: 74 },
          { label: 'BNB Confidence', pct: 68 },
          { label: 'ETH Confidence', pct: 61 },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Net Worth', value: '$148,294' },
          { label: 'PnL 30D',  value: '+$22,410' },
          { label: 'Win Rate', value: '73%' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Main Wallet',   sub: '0x1A2B…F3C9 · Active', badge: '$108,420' },
          { icon: 'layers', title: 'DeFi Vault',    sub: '0x9C4D…A12F · Active', badge: '$31,840' },
          { icon: 'lock',   title: 'Cold Storage',  sub: '0x7E8F…2B91 · Active', badge: '$8,034' },
        ]},
        { type: 'progress', items: [
          { label: 'Risk Score (Moderate)', pct: 58 },
        ]},
        { type: 'tags', label: 'Settings', items: ['Notifications', 'Security', 'AI Prefs', 'Integrations'] },
        { type: 'text', label: 'Account', value: 'Verified DeFi Pro · Member since Jan 2024 · 2FA enabled · Biometric auth active' },
      ],
    },
  ],
  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'markets',   label: 'Markets',   icon: 'search' },
    { id: 'trade',     label: 'Trade',     icon: 'plus' },
    { id: 'signals',   label: 'Signals',   icon: 'zap' },
    { id: 'profile',   label: 'Profile',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building VEGA Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'vega-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
