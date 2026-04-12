import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ALLOY',
  tagline:   'Wealth composition, forged with precision',
  archetype: 'fintech-dark',
  palette: {
    bg:      '#0B0C10',
    surface: '#14162A',
    text:    '#E8E9F0',
    accent:  '#7C5CFC',
    accent2: '#FF6B6B',
    muted:   'rgba(232,233,240,0.35)',
  },
  lightPalette: {
    bg:      '#F4F4F8',
    surface: '#FFFFFF',
    text:    '#0D0E14',
    accent:  '#6C4EF5',
    accent2: '#E55555',
    muted:   'rgba(13,14,20,0.4)',
  },
  screens: [
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$284,917', sub: '▲ 8.4% year-to-date' },
        { type: 'metric-row', items: [
          { label: 'Liquid', value: '$42.1K' },
          { label: 'Invested', value: '$218K' },
          { label: 'Debt', value: '−$24.8K' },
        ]},
        { type: 'tags', label: 'Alloy Composition', items: ['Equities 50%', 'Bonds 20%', 'Real Estate 16%', 'Alts 14%'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'VTI — Bought 2 shares', sub: 'Today', badge: '+$430' },
          { icon: 'share', title: 'HYSA Transfer', sub: 'Mar 24', badge: '$2K' },
        ]},
      ],
    },
    {
      id: 'elements', label: 'Elements',
      content: [
        { type: 'text', label: 'Alloy Breakdown', value: 'Each asset class is an elemental building block of your wealth.' },
        { type: 'progress', items: [
          { label: 'Equities · $142,400', pct: 50 },
          { label: 'Bonds · $57,800', pct: 20 },
          { label: 'Real Estate · $45,500', pct: 16 },
          { label: 'Alternatives · $39,200', pct: 14 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Best Asset', value: '+12.3%' },
          { label: 'Positions', value: '22' },
        ]},
      ],
    },
    {
      id: 'cashflow', label: 'Cashflow',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income', value: '$8,420' },
          { label: 'Spent', value: '$4,187' },
          { label: 'Saved', value: '$4,233' },
        ]},
        { type: 'metric', label: 'Savings Rate', value: '50.3%', sub: 'Excellent — above your 45% target' },
        { type: 'progress', items: [
          { label: 'Housing', pct: 34 },
          { label: 'Food & Dining', pct: 16 },
          { label: 'Shopping', pct: 21 },
          { label: 'Transport', pct: 7 },
          { label: 'Subscriptions', pct: 6 },
        ]},
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'list', items: [
          { icon: 'alert', title: 'Alts overweight by 4%', sub: 'HIGH · Trim BTC or Gold to rebalance', badge: '!' },
          { icon: 'bell', title: 'Emergency fund dip', sub: 'MEDIUM · HYSA below $10K threshold', badge: '↓' },
          { icon: 'zap', title: 'QQQ up 3.2%', sub: 'Tech rally · Position gained +$1,240', badge: '▲' },
          { icon: 'star', title: 'Tax-loss: INTC −18%', sub: 'Harvest up to $3.8K in losses', badge: '⚡' },
        ]},
        { type: 'tags', label: 'Signal Types', items: ['Rebalance', 'Alerts', 'Market', 'Tax'] },
      ],
    },
    {
      id: 'forge', label: 'Forge',
      content: [
        { type: 'text', label: 'Rebalance Scenario', value: 'Drag sliders to simulate portfolio rebalancing toward your target alloy.' },
        { type: 'progress', items: [
          { label: 'Equities · Target 55%', pct: 55 },
          { label: 'Bonds · Target 15%', pct: 15 },
          { label: 'Real Estate · Target 20%', pct: 20 },
          { label: 'Alternatives · Target 10%', pct: 10 },
        ]},
        { type: 'metric', label: 'Forge Plan', value: 'Buy $13,700 VTI', sub: 'Sell $13,700 BTC · Est. tax: −$420' },
        { type: 'tags', label: 'Outcome', items: ['Tax −$420', '+0.18% return', '$0 fees'] },
      ],
    },
  ],
  nav: [
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'elements',  label: 'Elements',  icon: 'layers' },
    { id: 'cashflow',  label: 'Cashflow',  icon: 'activity' },
    { id: 'signals',   label: 'Signals',   icon: 'zap' },
    { id: 'forge',     label: 'Forge',     icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'alloy-mock', 'ALLOY — Interactive Mock');
console.log('Mock live at:', result.url);
