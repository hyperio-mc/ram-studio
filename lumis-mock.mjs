// LUMIS — Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LUMIS',
  tagline:   'See through your finances',
  archetype: 'personal-finance-clarity',

  palette: {               // dark theme
    bg:      '#0D0B14',
    surface: 'rgba(255,255,255,0.06)',
    text:    '#F5F3FF',
    accent:  '#9B7FFF',
    accent2: '#FF8C42',
    muted:   'rgba(245,243,255,0.40)',
  },

  lightPalette: {          // LIGHT theme (primary for this design)
    bg:      '#F3F0EC',
    surface: 'rgba(255,255,255,0.72)',
    text:    '#1C1917',
    accent:  '#6B4FE9',
    accent2: '#F97316',
    muted:   'rgba(28,25,23,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric',     label: 'Net Worth',    value: '$284,910', sub: '↑ +$4,230 · +1.5% this month' },
        { type: 'metric-row', items: [
            { label: 'Income',  value: '$8,400' },
            { label: 'Spend',   value: '$3,240' },
            { label: 'Saved',   value: '$1,860' }
        ]},
        { type: 'progress',   items: [
            { label: 'Housing 35%',   pct: 35 },
            { label: 'Food 22%',      pct: 22 },
            { label: 'Transport 14%', pct: 14 }
        ]},
        { type: 'text',       label: 'AI Insight', value: '⚡ You spent 18% less on food than last month. On track to hit your $500 savings goal.' },
      ]
    },
    {
      id: 'accounts', label: 'Accounts',
      content: [
        { type: 'metric',     label: 'Total Balance',  value: '$284,910', sub: '+$4,230 today across 6 accounts' },
        { type: 'list',       items: [
            { icon: 'layers', title: 'Chase Checking ••4821',  sub: '$12,440',   badge: '✓' },
            { icon: 'layers', title: 'Marcus HYSA ••0034',     sub: '$48,200',   badge: '✓' },
            { icon: 'chart',  title: 'Fidelity Brokerage',     sub: '$143,800',  badge: '↑' },
            { icon: 'zap',    title: 'Coinbase Crypto',        sub: '$18,470',   badge: '↓' },
            { icon: 'star',   title: 'Amex Platinum ••1009',   sub: '-$3,240',   badge: '!' }
        ]},
      ]
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'tags',  label: 'Filter', items: ['All', 'Food', 'Housing', 'Transport', 'Health'] },
        { type: 'list',  items: [
            { icon: 'home',     title: 'Ramen-Ya',    sub: 'Today · Food',       badge: '-$18' },
            { icon: 'activity', title: 'MTA Metro',   sub: 'Today · Transport',  badge: '-$3'  },
            { icon: 'zap',      title: 'Salary',      sub: 'Yesterday · Income', badge: '+$4.2K' },
            { icon: 'heart',    title: 'Equinox',     sub: 'Yesterday · Health', badge: '-$180' },
            { icon: 'code',     title: 'AWS',         sub: 'Yesterday · Tech',   badge: '-$25' },
            { icon: 'home',     title: 'Whole Foods', sub: 'Mar 28 · Food',      badge: '-$112' }
        ]},
      ]
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric',   label: 'Monthly Budget', value: '$420 / $3,500', sub: 'April · 28 days left · On track' },
        { type: 'progress', items: [
            { label: 'Housing   $94 / $1,200',  pct: 8  },
            { label: 'Food      $131 / $600',   pct: 22 },
            { label: 'Transport $53 / $200',    pct: 27 },
            { label: 'Health    $180 / $300',   pct: 60 },
            { label: 'Shopping  $0 / $400',     pct: 0  }
        ]},
        { type: 'metric',   label: '✈️ Japan Trip Goal', value: '56%', sub: '$2,800 of $5,000 · Sep 2026' },
      ]
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
            { label: 'Avg weekly spend', value: '$408' },
            { label: 'vs last month',    value: '-12%' },
        ]},
        { type: 'list',  items: [
            { icon: 'check',  title: 'Great food month',       sub: 'Food spend down 18% vs March',          badge: '📉' },
            { icon: 'alert',  title: 'Subscription check',     sub: '2 of 6 look unused — $128/mo at risk',  badge: '⚡' },
            { icon: 'star',   title: 'HYSA rate update',       sub: 'Marcus moved to 5.0% APY (+$200/yr)',   badge: '📈' }
        ]},
        { type: 'progress', items: [
            { label: 'Net worth growth (12mo)', pct: 26 }
        ]},
        { type: 'text', label: 'Net worth change', value: 'From $226,000 → $284,910 · +$58,910 (+26%) in 12 months.' }
      ]
    }
  ],

  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'home'    },
    { id: 'accounts',  label: 'Accounts',  icon: 'layers'  },
    { id: 'activity',  label: 'Activity',  icon: 'list'    },
    { id: 'budget',    label: 'Budget',    icon: 'chart'   },
    { id: 'insights',  label: 'Insights',  icon: 'eye'     }
  ]
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lumis-mock', 'LUMIS — Interactive Mock');
console.log('Mock live at:', result.url);
