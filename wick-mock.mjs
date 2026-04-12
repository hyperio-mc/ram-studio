import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WICK',
  tagline:   'read the market, feel the move',
  archetype: 'fintech-trading',

  palette: {
    bg:      '#0B0A07',
    surface: '#141209',
    text:    '#F5F0E8',
    accent:  '#F59E0B',
    accent2: '#22C55E',
    muted:   'rgba(245,240,232,0.38)',
  },
  lightPalette: {
    bg:      '#FAFAF7',
    surface: '#FFFFFF',
    text:    '#1A1712',
    accent:  '#D97706',
    accent2: '#16A34A',
    muted:   'rgba(26,23,18,0.45)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$84,291', sub: '▲ +$1,284 today (+1.55%)' },
        { type: 'metric-row', items: [
          { label: 'BTC', value: '+2.3%' },
          { label: 'ETH', value: '+1.8%' },
          { label: 'SOL', value: '-0.9%' },
          { label: '24h Vol', value: '$2.1B' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Bitcoin (BTC)',  sub: '$71,240.50', badge: '+2.31%' },
          { icon: 'chart',    title: 'Ethereum (ETH)', sub: '$3,812.00',  badge: '+1.84%' },
          { icon: 'zap',      title: 'Solana (SOL)',   sub: '$188.40',    badge: '-0.92%' },
        ]},
        { type: 'text', label: 'Market Sentiment', value: 'Crypto markets showing bullish momentum. BTC up 2.3% with ETH following. SOL consolidating after last week\'s run.' },
      ],
    },
    {
      id: 'markets',
      label: 'Markets',
      content: [
        { type: 'metric-row', items: [
          { label: 'Gainers', value: '14' },
          { label: 'Losers',  value: '6'  },
          { label: 'Flat',    value: '3'  },
        ]},
        { type: 'list', items: [
          { icon: 'chart',    title: 'BTC / USD',  sub: '$71,240  7d: +8.4%',  badge: '+2.3%'  },
          { icon: 'activity', title: 'ETH / USD',  sub: '$3,812   7d: +5.1%',  badge: '+1.8%'  },
          { icon: 'zap',      title: 'SOL / USD',  sub: '$188.40  7d: -2.2%',  badge: '-0.9%'  },
          { icon: 'star',     title: 'BNB / USD',  sub: '$412.80  7d: +6.8%',  badge: '+3.1%'  },
          { icon: 'layers',   title: 'ADA / USD',  sub: '$0.482   7d: -3.4%',  badge: '-1.2%'  },
          { icon: 'grid',     title: 'DOT / USD',  sub: '$7.84    7d: +1.8%',  badge: '+0.6%'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Gainers', 'Losers', 'DeFi', 'L1s'] },
      ],
    },
    {
      id: 'chart',
      label: 'BTC Chart',
      content: [
        { type: 'metric', label: 'BTC / USD · 1D', value: '$71,240', sub: '▲ +$1,607 today (+2.31%) · Open $69,633' },
        { type: 'metric-row', items: [
          { label: '24h High', value: '$72,100' },
          { label: '24h Low',  value: '$69,200' },
          { label: 'Volume',   value: '$38.2B'  },
        ]},
        { type: 'progress', items: [
          { label: '14-day RSI', pct: 62 },
          { label: 'Volume vs Avg', pct: 78 },
          { label: 'Buy Pressure', pct: 71 },
        ]},
        { type: 'tags', label: 'Timeframe', items: ['15m', '1H', '4H', '1D', '1W', 'ALL'] },
        { type: 'text', label: 'Analysis', value: 'BTC testing resistance at $72K. RSI at 62 — not yet overbought. Strong volume confirms bullish momentum. Watch for breakout above $72,500.' },
      ],
    },
    {
      id: 'trade',
      label: 'Place Order',
      content: [
        { type: 'metric', label: 'Buy BTC — Limit Order', value: '$71,200', sub: 'Market price: $71,240  · Slippage: 0.06%' },
        { type: 'metric-row', items: [
          { label: 'Amount',   value: '0.025' },
          { label: 'USD Value', value: '$1,780' },
          { label: 'Fee',      value: '$1.78'  },
          { label: 'Net Total', value: '$1,782' },
        ]},
        { type: 'progress', items: [
          { label: 'Order Size (% of balance)', pct: 21 },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Limit Order',    sub: 'Executes at $71,200 or lower',  badge: 'Active' },
          { icon: 'alert',  title: 'Est. Execution', sub: 'Within 2–4 hours at this price', badge: '~2h'    },
          { icon: 'lock',   title: 'Available',      sub: 'USDT balance for this order',    badge: '$8,420'  },
        ]},
        { type: 'text', label: 'Note', value: 'Limit orders may not execute if price moves above $71,200. Order remains active for 30 days.' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',    value: '3' },
          { label: 'Triggered', value: '1' },
          { label: 'Paused',    value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',     title: 'BTC above $72,000',  sub: '1.1% away · Will notify',    badge: 'ON'      },
          { icon: 'bell',     title: 'ETH above $4,000',   sub: '4.9% away · Will notify',    badge: 'ON'      },
          { icon: 'bell',     title: 'SOL below $175',     sub: '7.1% away · Will notify',    badge: 'ON'      },
          { icon: 'check',    title: 'BTC hit $70,000',    sub: 'Triggered today at 6:23 AM', badge: 'Done'    },
        ]},
        { type: 'text', label: 'Tip', value: 'Set a range alert to trigger when BTC breaks out of the $69K–$73K consolidation zone it\'s been in since Monday.' },
        { type: 'tags', label: 'Quick Add', items: ['BTC +5%', 'ETH $4K', 'SOL $200', 'BNB $450'] },
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Value', value: '$84,291', sub: '▲ +$1,284 today · All-time: +$14,291 (+20.4%)' },
        { type: 'metric-row', items: [
          { label: 'BTC',  value: '62%' },
          { label: 'ETH',  value: '19%' },
          { label: 'SOL',  value: '11%' },
          { label: 'Rest', value: '8%'  },
        ]},
        { type: 'progress', items: [
          { label: 'BTC  1.184 BTC · $84,380', pct: 62 },
          { label: 'ETH  4.2 ETH · $16,010',   pct: 20 },
          { label: 'SOL  48 SOL · $9,043',      pct: 11 },
          { label: 'BNB  12 BNB · $4,954',      pct: 6  },
          { label: 'ADA  2,100 ADA · $1,012',   pct: 1  },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Best Day',     sub: 'Mar 18 — BTC up 6.8%',       badge: '+$4,812' },
          { icon: 'alert',    title: 'Worst Day',    sub: 'Mar 3 — SOL down 12.1%',     badge: '-$1,240' },
          { icon: 'star',     title: 'Best Holding', sub: 'BTC +$2,140 since purchase', badge: '+2.6%'   },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home'     },
    { id: 'markets',   label: 'Markets', icon: 'chart'    },
    { id: 'trade',     label: 'Trade',   icon: 'plus'     },
    { id: 'alerts',    label: 'Alerts',  icon: 'bell'     },
    { id: 'portfolio', label: 'Port.',   icon: 'layers'   },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'wick');
const result = await publishMock(built, 'wick');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/wick-mock`);
