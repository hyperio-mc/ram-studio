import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FINCH',
  tagline:   'Know where your money flows',
  archetype: 'personal-finance-intelligence',

  palette: {           // DARK fallback
    bg:      '#1C1917',
    surface: '#292524',
    text:    '#F5F3EF',
    accent:  '#FF5C35',
    accent2: '#6366F1',
    muted:   'rgba(245,243,239,0.40)',
  },

  lightPalette: {      // LIGHT — primary theme for this design
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#FF5C35',
    accent2: '#6366F1',
    muted:   'rgba(28,25,23,0.42)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Total Spent · March', value: '$3,241', sub: 'of $4,500 budget · 72% used' },
        { type: 'metric-row', items: [{ label: 'Days Left', value: '16' }, { label: 'Daily Avg', value: '$104' }] },
        { type: 'progress', items: [
          { label: 'Housing (82%)',   pct: 82 },
          { label: 'Food & Drink (67%)', pct: 67 },
          { label: 'Transport (30%)', pct: 30 },
          { label: 'Shopping (28%)',  pct: 28 },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['＋ Add', '◷ Split', '⧉ Export', '⊛ Goals'] },
      ],
    },
    {
      id: 'categories', label: 'Categories',
      content: [
        { type: 'metric', label: 'This Month', value: '$2,323', sub: 'across 7 categories · ↑ from Feb' },
        { type: 'list', items: [
          { icon: '🏠', title: 'Housing',       sub: '$1,200 / $1,200', badge: '100%' },
          { icon: '🍽️', title: 'Food & Drink',  sub: '$486 / $600',    badge: '81%'  },
          { icon: '🚗', title: 'Transport',      sub: '$218 / $400',    badge: '55%'  },
          { icon: '🛍️', title: 'Shopping',       sub: '$198 / $300',    badge: '66%'  },
          { icon: '💊', title: 'Health',          sub: '$92 / $200',     badge: '46%'  },
          { icon: '☕', title: 'Coffee',           sub: '$82 / $80',      badge: 'OVER' },
        ]},
      ],
    },
    {
      id: 'transactions', label: 'Txns',
      content: [
        { type: 'text', label: 'Today', value: 'Net −$67.50' },
        { type: 'list', items: [
          { icon: '🍕', title: "Domino's Pizza",    sub: 'Food · Today',      badge: '−$34.50' },
          { icon: '🚇', title: 'Metro Card',         sub: 'Transport · Today', badge: '−$33.00' },
          { icon: '📦', title: 'Amazon',              sub: 'Shopping · Yest.',  badge: '−$67.99' },
          { icon: '☕', title: 'Blue Bottle Coffee',  sub: 'Coffee · Yest.',    badge: '−$7.25'  },
          { icon: '💰', title: 'Paycheck',            sub: 'Income · Mar 28',   badge: '+$3,200' },
          { icon: '🎬', title: 'Netflix',             sub: 'Entertain · Mar 26',badge: '−$15.99' },
        ]},
      ],
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric', label: 'Budget Used', value: '72%', sub: '$3,241 of $4,500 · $1,259 remaining' },
        { type: 'metric-row', items: [{ label: 'Remaining', value: '$1,259' }, { label: 'Days Left', value: '16' }] },
        { type: 'progress', items: [
          { label: 'Housing (100%)', pct: 100 },
          { label: 'Food (81%)',     pct: 81 },
          { label: 'Transport (55%)', pct: 55 },
          { label: 'Shopping (66%)', pct: 66 },
          { label: 'Health (46%)',   pct: 46 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: 'Finch AI · High Confidence', value: "You're spending $48 more on coffee this month vs. last. Brewing at home 3×/week could save $576 per year." },
        { type: 'progress', items: [
          { label: 'Monday $84',    pct: 38 },
          { label: 'Tuesday $127',  pct: 58 },
          { label: 'Wednesday $56', pct: 25 },
          { label: 'Thursday $98',  pct: 45 },
          { label: 'Friday $210',   pct: 96 },
          { label: 'Saturday $34',  pct: 15 },
        ]},
        { type: 'list', items: [
          { icon: '☕', title: 'Coffee Habit',      sub: 'Brew home 3×/wk → save $82/mo',         badge: '$984/yr' },
          { icon: '🛍️', title: 'Weekend Spending',  sub: 'You shop 40% more on Saturdays',          badge: 'Pattern' },
          { icon: '🎯', title: 'Budget Win!',         sub: 'Health is 54% under budget this month',   badge: '✓ Track' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'dashboard',    label: 'Home',     icon: 'home'     },
    { id: 'categories',   label: 'Spend',    icon: 'chart'    },
    { id: 'transactions', label: 'Txns',     icon: 'list'     },
    { id: 'budget',       label: 'Budget',   icon: 'activity' },
    { id: 'insights',     label: 'Insights', icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'finch-mock', 'FINCH — Interactive Mock');
console.log('Mock live at:', result.url);
