import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Coffer',
  tagline:   'your personal treasury',
  archetype: 'finance-tracker',

  palette: {
    bg:      '#1A1C20',
    surface: '#22252C',
    text:    '#EDE8DE',
    accent:  '#2ECC71',
    accent2: '#C8E83A',
    muted:   'rgba(237,232,222,0.4)',
  },

  lightPalette: {
    bg:      '#F9F7F2',
    surface: '#FFFFFF',
    text:    '#1C1C1A',
    accent:  '#1A5C40',
    accent2: '#C8E83A',
    muted:   'rgba(28,28,26,0.4)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$148,320', sub: '▲ +$2,841 this month (1.95%)' },
        { type: 'metric-row', items: [
          { label: 'Assets',  value: '$162.4K' },
          { label: 'Debts',   value: '$14.1K' },
          { label: 'Saved',   value: '$8,200' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Blue Bottle Coffee',  sub: 'Food & Drink · Today',    badge: '-$6.50' },
          { icon: 'zap',      title: 'Salary Deposit',      sub: 'Income · Apr 10',         badge: '+$4,200' },
          { icon: 'home',     title: 'Rent Transfer',       sub: 'Housing · Apr 1',         badge: '-$1,850' },
          { icon: 'grid',     title: 'Amazon Prime',        sub: 'Shopping · Yesterday',    badge: '-$14.99' },
        ]},
        { type: 'tags', label: 'Status', items: ['Budget on track ✓', 'Goal: Europe ✈️', '+1.95% ▲'] },
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Total Value', value: '$148,320', sub: 'Across 5 holdings' },
        { type: 'progress', items: [
          { label: 'US Equities (VTI)',      pct: 44 },
          { label: 'Real Estate (VNQ)',      pct: 22 },
          { label: 'High-Yield Cash (HYSA)', pct: 18 },
          { label: 'Crypto (BTC)',           pct: 10 },
          { label: 'Bonds (BND)',            pct: 6 },
        ]},
        { type: 'list', items: [
          { icon: 'chart',    title: 'US Equities',      sub: 'VTI · 44%',  badge: '+3.2%' },
          { icon: 'home',     title: 'Real Estate',      sub: 'VNQ · 22%',  badge: '+1.8%' },
          { icon: 'star',     title: 'High-Yield Cash',  sub: 'HYSA · 18%', badge: '+0.4%' },
          { icon: 'zap',      title: 'Crypto',           sub: 'BTC · 10%',  badge: '-2.1%' },
        ]},
      ],
    },
    {
      id: 'moves',
      label: 'Moves',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income',  value: '+$4,200' },
          { label: 'Spent',   value: '-$2,341' },
          { label: 'Net',     value: '+$1,859' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Blue Bottle Coffee',  sub: 'Food · 8:31am',    badge: '-$6.50' },
          { icon: 'map',      title: 'BART Clipper',        sub: 'Transport · 7:58am',badge: '-$3.80' },
          { icon: 'heart',    title: 'Sweetgreen',          sub: 'Food · 12:24pm',   badge: '-$14.25' },
          { icon: 'grid',     title: 'Amazon Prime',        sub: 'Shopping',         badge: '-$14.99' },
          { icon: 'zap',      title: 'Shell Station',       sub: 'Transport',        badge: '-$52.10' },
          { icon: 'user',     title: 'Barbershop',          sub: 'Personal',         badge: '-$35.00' },
        ]},
        { type: 'tags', label: 'April', items: ['174 transactions', 'avg -$13.45/day', 'Apr 2026'] },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Active Goals', value: '3', sub: '1 achieved this month 🎉' },
        { type: 'progress', items: [
          { label: 'Europe Trip ✈️ (Sep 2026)',       pct: 64 },
          { label: 'MacBook Pro 💻 (Jun 2026)',        pct: 60 },
          { label: 'Down Payment 🏠 (Dec 2028)',       pct: 28 },
        ]},
        { type: 'list', items: [
          { icon: 'map',      title: 'Europe Trip',      sub: '$3,840 of $6,000',   badge: '64%' },
          { icon: 'code',     title: 'MacBook Pro',      sub: '$2,100 of $3,500',   badge: '60%' },
          { icon: 'home',     title: 'Down Payment',     sub: '$22,400 of $80,000', badge: '28%' },
          { icon: 'check',    title: 'Emergency Fund',   sub: 'Completed Mar 2026', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Month',  value: '$2,341' },
          { label: 'Last Month',  value: '$2,250' },
          { label: 'Change',      value: '+4.1%' },
        ]},
        { type: 'progress', items: [
          { label: 'Housing',      pct: 79 },
          { label: 'Food & Drink', pct: 13 },
          { label: 'Transport',    pct: 5 },
          { label: 'Shopping',     pct: 2 },
          { label: 'Personal',     pct: 1 },
        ]},
        { type: 'list', items: [
          { icon: 'home',     title: 'Housing',      sub: '$1,850 · 79% of spending',  badge: '🏠' },
          { icon: 'activity', title: 'Food & Drink', sub: '$312 · 13% — down 7% ▼',   badge: '🍽' },
          { icon: 'map',      title: 'Transport',    sub: '$124 · 5% of spending',     badge: '🚇' },
        ]},
        { type: 'text', label: 'Insight', value: 'You spent 7% less on food vs March. Keep it up — on track for Europe Trip goal.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',      icon: 'home' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart' },
    { id: 'moves',     label: 'Moves',     icon: 'activity' },
    { id: 'goals',     label: 'Goals',     icon: 'star' },
    { id: 'insights',  label: 'Insights',  icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'coffer-mock', 'Coffer — Interactive Mock');
console.log('Mock live at:', result.url);
