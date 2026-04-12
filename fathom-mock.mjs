// fathom-mock.mjs — Svelte interactive mock for Fathom
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Fathom',
  tagline:   'See your money with total clarity.',
  archetype: 'finance-clarity',

  palette: {           // DARK
    bg:      '#07090F',
    surface: '#1A2235',
    text:    '#EEF2FF',
    accent:  '#7C6FF7',
    accent2: '#34D399',
    muted:   'rgba(136,146,176,0.50)',
  },

  lightPalette: {      // LIGHT
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    text:    '#0F1728',
    accent:  '#5B4EE8',
    accent2: '#059669',
    muted:   'rgba(15,23,40,0.42)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Net Worth',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$248,619', sub: '↑ +2.4% this month' },
        { type: 'metric-row', items: [
          { label: 'Assets', value: '$312K' },
          { label: 'Debt',   value: '$63K'  },
          { label: 'Cash',   value: '$18K'  },
        ]},
        { type: 'list', items: [
          { icon: 'home',   title: 'Rent Payment',     sub: 'Housing · Apr 1',  badge: '–$2,200' },
          { icon: 'zap',    title: 'Freelance Deposit', sub: 'Income · Mar 31', badge: '+$3,500' },
          { icon: 'chart',  title: 'AAPL Purchase',    sub: 'Investing · Mar 29',badge: '–$890'  },
        ]},
        { type: 'text', label: 'Trend', value: 'Net worth up $5,831 over the last 12 months — strongest growth in Housing equity.' },
      ],
    },
    {
      id: 'cashflow',
      label: 'Cash Flow',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income',  value: '$7,840' },
          { label: 'Spent',   value: '$5,210' },
          { label: 'Saved',   value: '$2,630' },
        ]},
        { type: 'progress', items: [
          { label: 'Housing',   pct: 42 },
          { label: 'Food',      pct: 18 },
          { label: 'Transport', pct: 12 },
          { label: 'Health',    pct: 9  },
          { label: 'Other',     pct: 19 },
        ]},
        { type: 'tags', label: 'Month', items: ['Jan', 'Feb', 'Mar ✓', 'Apr'] },
        { type: 'text', label: 'Summary', value: 'You spent $180 less than February. Housing remains your largest category at 42% of total spending.' },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Active Goals', value: '3', sub: '1 completed this quarter' },
        { type: 'progress', items: [
          { label: 'Emergency Fund  71%', pct: 71 },
          { label: 'Japan Trip  46%',     pct: 46 },
          { label: 'MacBook Pro  60%',    pct: 60 },
          { label: 'Index Fund  100% ✓',  pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Emergency Fund', sub: '4 months left',  badge: '$14,200' },
          { icon: 'map',    title: 'Japan Trip',     sub: '8 months left',  badge: '$3,640'  },
          { icon: 'star',   title: 'MacBook Pro',    sub: '3 months left',  badge: '$2,100'  },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'AI Insights',
      content: [
        { type: 'metric', label: 'Fathom Intelligence', value: '3', sub: 'New insights this week' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'Subscription creep', sub: '3 unused subs · $88/mo wasted', badge: '⚠' },
          { icon: 'zap',      title: 'HYSA opportunity',   sub: 'Earn $384/yr more on idle cash', badge: '💡' },
          { icon: 'activity', title: 'Weekend spending',   sub: '38% spike Saturdays — dining',  badge: '📊' },
        ]},
        { type: 'text', label: 'AI Note', value: 'You\'re on track to save $340 more than last month. Keep the weekend dining budget in check to hit your Japan goal by December.' },
        { type: 'tags', label: 'Categories', items: ['Savings', 'Subscriptions', 'Patterns', 'Opportunities'] },
      ],
    },
    {
      id: 'bills',
      label: 'Bills',
      content: [
        { type: 'metric', label: 'Monthly Bills', value: '$284', sub: '6 subscriptions · 3 due this week' },
        { type: 'list', items: [
          { icon: 'home',     title: 'Rent',       sub: 'Due Apr 1 · AUTO',   badge: '$2,200' },
          { icon: 'play',     title: 'Netflix',    sub: 'Due Apr 5 · AUTO',   badge: '$22.99' },
          { icon: 'heart',    title: 'Spotify',    sub: 'Due Apr 7 · AUTO',   badge: '$11.99' },
          { icon: 'eye',      title: 'Adobe CC',   sub: 'UNUSED 60+ days',    badge: '$54.99' },
          { icon: 'activity', title: 'Gym',        sub: 'UNUSED 60+ days',    badge: '$49.99' },
        ]},
        { type: 'text', label: 'Action', value: 'Cancelling 2 unused subscriptions (Adobe CC + Gym) would save $1,259/year.' },
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'home'   },
    { id: 'cashflow', label: 'Cash Flow', icon: 'chart' },
    { id: 'goals',    label: 'Goals',    icon: 'star'   },
    { id: 'insights', label: 'Insights', icon: 'zap'    },
    { id: 'bills',    label: 'Bills',    icon: 'bell'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'fathom-mock', 'Fathom — Interactive Mock');
console.log('Mock live at:', result.url);
