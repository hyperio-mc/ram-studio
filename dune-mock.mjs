// dune-mock.mjs — Svelte interactive mock for DUNE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DUNE',
  tagline:   'Know your money. Clearly.',
  archetype: 'fintech-dark',
  palette: {           // DARK — warm charcoal + amber gold
    bg:      '#0C0B09',
    surface: '#171512',
    text:    '#F5F0E8',
    accent:  '#E8B467',
    accent2: '#6BBF8A',
    muted:   'rgba(245,240,232,0.38)',
  },
  lightPalette: {
    bg:      '#F5F2ED',
    surface: '#FFFFFF',
    text:    '#1A1712',
    accent:  '#C4883A',
    accent2: '#3D8A5C',
    muted:   'rgba(26,23,18,0.42)',
  },
  screens: [
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$147,832', sub: '▲ +$2,341 this month' },
        { type: 'metric-row', items: [
          { label: 'Spent', value: '$1,240' },
          { label: 'Saved', value: '$680' },
          { label: 'Rate', value: '35%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Spotify', sub: 'Subscriptions', badge: '-$9.99' },
          { icon: 'zap', title: 'Salary Credit', sub: 'Income', badge: '+$4,200' },
          { icon: 'chart', title: 'VTSAX', sub: 'Investment', badge: '-$500' },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Your savings rate is 6% above your 3-month average — keep going.' },
      ],
    },
    {
      id: 'spend', label: 'Spend',
      content: [
        { type: 'metric', label: 'This Week', value: '$348', sub: '↑ 8% vs last week' },
        { type: 'progress', items: [
          { label: 'Food & Drink',  pct: 82 },
          { label: 'Transport',     pct: 40 },
          { label: 'Subscriptions', pct: 32 },
          { label: 'Health',        pct: 28 },
          { label: 'Shopping',      pct: 20 },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Food spending 18% higher vs last week — 3 restaurant visits detected.' },
      ],
    },
    {
      id: 'save', label: 'Save',
      content: [
        { type: 'metric', label: 'Total Saved', value: '$18,400', sub: '43% of $42,000 target' },
        { type: 'progress', items: [
          { label: 'Emergency Fund', pct: 70 },
          { label: 'Japan Trip',     pct: 47 },
          { label: 'MacBook Pro',    pct: 80 },
          { label: 'Invest Seed',    pct: 20 },
        ]},
        { type: 'tags', label: 'Goal Health', items: ['On Track', '3 Active', '1 Near Done'] },
        { type: 'text', label: 'AI Insight', value: 'MacBook goal is 80% done — on track to complete 2 weeks early.' },
      ],
    },
    {
      id: 'invest', label: 'Invest',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$68,240', sub: '▲ +$4,820 (7.6%) all-time' },
        { type: 'metric-row', items: [
          { label: 'YTD', value: '+12.4%' },
          { label: 'Gain', value: '+$4,820' },
          { label: 'Beta', value: '0.94' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'US Index — VTSAX', sub: '45% · $30,708', badge: '▲' },
          { icon: 'globe', title: 'Intl ETF — VXUS', sub: '20% · $13,648', badge: '▲' },
          { icon: 'star', title: 'Bonds — BND', sub: '15% · $10,236', badge: '→' },
          { icon: 'zap', title: 'Crypto — BTC/ETH', sub: '12% · $8,189', badge: '↑' },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Crypto allocation drifted +2% this month — consider rebalancing.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Health Score', value: '78', sub: '▲ +3 from last week' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Thursday spend spike',  sub: '2.4× daily avg — suggest $40 cap', badge: '⚠' },
          { icon: 'zap',      title: 'Move cash to HYSA',     sub: '$2,100 idle — $8.50/mo lost',       badge: '↗' },
          { icon: 'alert',    title: 'Subscription creep',    sub: '+$34.97/mo in new charges',          badge: '!' },
          { icon: 'check',    title: '6-week savings streak', sub: 'Your best streak yet',               badge: '✓' },
        ]},
        { type: 'tags', label: 'This Week', items: ['Saving 82', 'Spending 71', 'Investing 79'] },
      ],
    },
  ],
  nav: [
    { id: 'pulse',    label: 'Pulse',   icon: 'activity' },
    { id: 'spend',    label: 'Spend',   icon: 'chart' },
    { id: 'save',     label: 'Save',    icon: 'star' },
    { id: 'invest',   label: 'Invest',  icon: 'zap' },
    { id: 'insights', label: 'Insights',icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'dune-mock', 'DUNE — Interactive Mock');
console.log('Mock live at:', result.url);
