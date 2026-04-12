import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BRIM',
  tagline:   'Your money, finally intelligent.',
  archetype: 'fintech-ai-dark',
  palette: {
    bg:      '#080810',
    surface: '#0F0F1C',
    text:    '#F0F0FC',
    accent:  '#7B5CF0',
    accent2: '#00E5B4',
    muted:   'rgba(240,240,252,0.45)',
  },
  lightPalette: {
    bg:      '#F4F4FC',
    surface: '#FFFFFF',
    text:    '#0E0E1E',
    accent:  '#6B4CE0',
    accent2: '#00C49A',
    muted:   'rgba(14,14,30,0.45)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$284,391', sub: '↑ +$3,241 (+1.2%) this month' },
        { type: 'metric-row', items: [
          { label: 'Cash', value: '$24.1K' },
          { label: 'Invested', value: '$198K' },
          { label: 'Debt', value: '$62K' },
        ]},
        { type: 'list', items: [
          { icon: 'home', title: 'Rent', sub: 'Due Apr 3', badge: '$2,200' },
          { icon: 'play', title: 'Netflix', sub: 'Due Apr 1', badge: '$15.99' },
          { icon: 'zap', title: 'Gym', sub: 'Due Apr 5', badge: '$45.00' },
        ]},
        { type: 'text', label: '✦ BRIM AI Insight', value: 'Move $2K from savings to your index fund — beats your 1.2% yield by 3.6%.' },
      ],
    },
    {
      id: 'spending', label: 'Spending',
      content: [
        { type: 'metric', label: 'Spent This Month', value: '$3,847', sub: 'of $5,000 budget · 77% used' },
        { type: 'progress', items: [
          { label: 'Housing', pct: 57 },
          { label: 'Food & Dining', pct: 17 },
          { label: 'Transport', pct: 10 },
          { label: 'Entertainment', pct: 8 },
          { label: 'Health', pct: 5 },
        ]},
        { type: 'tags', label: 'Top Merchants', items: ['Uber Eats', 'Whole Foods', 'Shell', 'Amazon', 'Netflix'] },
      ],
    },
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$198,420', sub: '▲ 5.7% all-time return' },
        { type: 'progress', items: [
          { label: 'Equities (62%)', pct: 62 },
          { label: 'Crypto (18%)', pct: 18 },
          { label: 'Bonds (12%)', pct: 12 },
          { label: 'Cash (8%)', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'VTI — Vanguard Total', sub: '38% of portfolio', badge: '+1.8%' },
          { icon: 'star', title: 'AAPL — Apple Inc.', sub: '24% of portfolio', badge: '+0.4%' },
          { icon: 'activity', title: 'BTC — Bitcoin', sub: '18% of portfolio', badge: '-2.1%' },
          { icon: 'chart', title: 'QQQ — Invesco', sub: '14% of portfolio', badge: '+3.2%' },
        ]},
      ],
    },
    {
      id: 'ai', label: 'BRIM AI',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '84 / 100', sub: 'Excellent · Top 14% of users' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Earn 4.8% APY not 1.2%', sub: 'Move $15K to high-yield savings → +$540/yr', badge: '↑' },
          { icon: 'alert', title: 'Dining up 34% this month', sub: '3 Uber Eats orders = $180 of $428 dining', badge: '⚠' },
          { icon: 'layers', title: 'Crypto overweight by 7%', sub: 'BTC at 22% vs 15% target — trim $2.4K', badge: '◈' },
        ]},
        { type: 'text', label: 'AI Model', value: 'BRIM reads your full financial picture daily and generates personalised, actionable insights — not generic tips.' },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric-row', items: [
          { label: 'On Track', value: '3 / 4' },
          { label: 'Total Saved', value: '$41.2K' },
        ]},
        { type: 'progress', items: [
          { label: 'Emergency Fund  ($12.4K / $15K)', pct: 83 },
          { label: 'House Down Payment  ($22.8K / $80K)', pct: 29 },
          { label: 'Dream Vacation  ($5.1K / $6K)', pct: 85 },
          { label: 'Early Retirement  ($198K / $1.5M)', pct: 13 },
        ]},
        { type: 'tags', label: 'Status', items: ['On Track ✓', 'Behind ⚠', 'On Track ✓', 'Long-term →'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'spending', label: 'Pulse', icon: 'activity' },
    { id: 'ai', label: 'BRIM AI', icon: 'zap' },
    { id: 'goals', label: 'Goals', icon: 'star' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'brim-mock', 'BRIM — Interactive Mock');
console.log('Mock live at:', result.url);
