import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Vale',
  tagline:   'Your money, journalled daily',
  archetype: 'personal-finance',
  palette: {
    bg:      '#2C1A10',
    surface: '#3D2518',
    text:    '#F2EDE4',
    accent:  '#C4956A',
    accent2: '#7B9B6B',
    muted:   'rgba(242,237,228,0.4)',
  },
  lightPalette: {
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#1C1510',
    accent:  '#4A3728',
    accent2: '#7B9B6B',
    muted:   'rgba(28,21,16,0.4)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Thursday, April 10', value: '$4,812', sub: 'Available today · On track' },
        { type: 'metric-row', items: [
          { label: 'Income', value: '+$3,200' },
          { label: 'Spent', value: '$101.71' },
          { label: 'Net', value: '+$3,098' },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Blue Bottle Coffee', sub: 'Food & Drink', badge: '-$6.50' },
          { icon: 'play',  title: 'Spotify',            sub: 'Subscriptions', badge: '-$10.99' },
          { icon: 'zap',   title: 'Salary deposit',     sub: 'Income',        badge: '+$3,200' },
          { icon: 'home',  title: 'Whole Foods',        sub: 'Groceries',     badge: '-$84.22' },
        ]},
        { type: 'tags', label: 'Mood', items: ['Optimistic', 'On track', 'Calm'] },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'April 10 · Reflection', value: '71/100', sub: 'Financial wellbeing score' },
        { type: 'text', label: 'Today\'s note', value: 'Kept grocery spending within budget. Spotify auto-renewed — should review subscriptions next month. Income arrived early which was a pleasant surprise.' },
        { type: 'tags', label: 'Tags', items: ['on-track', 'subscriptions', 'income'] },
        { type: 'metric-row', items: [
          { label: 'Income',   value: '+$3,200' },
          { label: 'Expenses', value: '-$101' },
        ]},
      ],
    },
    {
      id: 'spending',
      label: 'Spending',
      content: [
        { type: 'metric', label: 'April 2026', value: '$1,847', sub: 'Total spent this month' },
        { type: 'progress', items: [
          { label: 'Housing',       pct: 42 },
          { label: 'Food',          pct: 22 },
          { label: 'Transport',     pct: 14 },
          { label: 'Subscriptions', pct: 9  },
          { label: 'Other',         pct: 13 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Budget',    value: '$2,400' },
          { label: 'Used',      value: '77%' },
          { label: 'Left',      value: '$553' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: '6-month average', value: '$257', sub: 'Monthly savings · Up 18%' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Subscriptions down',     sub: 'Cut $32/mo in recurring costs',        badge: '↓' },
          { icon: 'alert',    title: 'Food spending rising',   sub: 'Up 8% over 3 months — review?',        badge: '↑' },
          { icon: 'check',    title: 'Savings target on pace', sub: 'Q2 goal: $1,500 · Saved: $920',        badge: '✓' },
          { icon: 'bell',     title: 'Unused subscriptions',   sub: 'LinkedIn Premium — 40d since last use', badge: '!' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Emergency Fund', value: '$8,240', sub: 'of $12,000 · 68.7% · ~4 months' },
        { type: 'progress', items: [
          { label: 'Emergency Fund', pct: 69 },
          { label: 'Japan trip',     pct: 30 },
          { label: 'New laptop',     pct: 50 },
          { label: 'Pay off card',   pct: 83 },
        ]},
        { type: 'text', label: 'Next step', value: 'Add $420/mo to stay on track for Emergency Fund goal. Pay off card is nearly there — strong quarter.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'journal',  label: 'Journal',  icon: 'list'     },
    { id: 'spending', label: 'Spending', icon: 'chart'    },
    { id: 'insights', label: 'Insights', icon: 'activity' },
    { id: 'goals',    label: 'Goals',    icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vale-mock', 'Vale — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/vale-mock');
